from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import jwt
import datetime
import os
from typing import Optional
import bcrypt

from ..database import get_db
from ..models import User, PortfolioSettings
from ..services.github import GitHubService

# Load JWT configs from env
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtsecretkeychangeinproduction12345")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def create_jwt_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    """
    Generate a JWT token for the authenticated user session.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency to validate JWT from cookies and return the current logged-in user.
    """
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to Authorization header if needed
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials - user_id missing",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check existing email
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check existing username
    user_by_username = db.query(User).filter(User.username == req.username).first()
    if user_by_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(req.password)
    
    new_user = User(
        email=req.email,
        username=req.username,
        hashed_password=hashed_password,
        name=req.username
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default portfolio settings
    portfolio = PortfolioSettings(
        user_id=new_user.id,
        title=f"{new_user.username}'s Portfolio",
        bio="Welcome to my portfolio! Here is a collection of my projects.",
        contact_email=new_user.email,
        theme_name="dark-neon",
        layout_style="modern"
    )
    db.add(portfolio)
    db.commit()

    return {"message": "User created successfully"}

@router.post("/login")
def login_user(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token_data = {"user_id": user.id, "username": user.username}
    jwt_token = create_jwt_token(token_data)

    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False, # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "name": user.name
        }
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"message": "Logout successful"}


@router.get("/login-url")
def get_login_url():
    """
    Return the URL to redirect the user to GitHub for authentication.
    """
    url = GitHubService.get_auth_url()
    return {"url": url}

@router.get("/callback")
async def github_callback(code: str, response: Response, db: Session = Depends(get_db)):
    """
    Handle GitHub redirect callback.
    If the user is logged in, link GitHub. If not, maybe error out or we just login with github (fallback).
    Since we are migrating to local auth first, let's allow GitHub login/register as a secondary option.
    """
    # 1. Exchange OAuth code for GitHub access token
    access_token = await GitHubService.exchange_code_for_token(code)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange GitHub authorization code"
        )

    # 2. Fetch user profile from GitHub API
    github_user = await GitHubService.get_user_profile(access_token)
    if not github_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch GitHub profile details"
        )

    github_id = github_user.get("id")
    username = github_user.get("login")
    name = github_user.get("name")
    email = github_user.get("email")
    avatar_url = github_user.get("avatar_url")
    bio = github_user.get("bio")

    # 3. Check if user already exists
    user = db.query(User).filter(User.github_id == github_id).first()

    if not user:
        # Check if email matches existing local user
        if email:
            user = db.query(User).filter(User.email == email).first()

        if user:
            # Link github to existing user
            user.github_id = github_id
            user.access_token = access_token
            if not user.avatar_url:
                user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)
        else:
            # Create / Register new user via GitHub
            # Generating a random password for github-only users
            import secrets
            random_pass = secrets.token_urlsafe(32)
            hashed_pass = get_password_hash(random_pass)

            user = User(
                email=email or f"{username}@github.local",
                hashed_password=hashed_pass,
                github_id=github_id,
                username=username,
                name=name,
                avatar_url=avatar_url,
                access_token=access_token
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Initialize default portfolio settings
            portfolio = PortfolioSettings(
                user_id=user.id,
                title=f"{name or username}'s Portfolio",
                bio=bio or "Welcome to my portfolio! Here is a collection of my projects.",
                contact_email=email,
                theme_name="dark-neon",
                layout_style="modern"
            )
            db.add(portfolio)
            db.commit()
    else:
        # Update existing user credentials & details
        if username:
            user.username = username
        if name:
            user.name = name
        if avatar_url:
            user.avatar_url = avatar_url
        user.access_token = access_token
        db.commit()
        db.refresh(user)

    # 4. Generate JWT token
    token_data = {"user_id": user.id, "username": user.username}
    jwt_token = create_jwt_token(token_data)

    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Instead of returning JSON (which frontend might not catch if it's a direct browser redirect), 
    # we should redirect the user back to the dashboard since it's an OAuth callback directly hit by browser.
    # We will use RedirectResponse.
    from fastapi.responses import RedirectResponse
    redirect_url = "http://localhost:5173/dashboard"
    res = RedirectResponse(url=redirect_url)
    res.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return res

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return active session user profile.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "email": current_user.email,
        "github_connected": current_user.github_id is not None
    }
