from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
import datetime
import os
from typing import Optional

from ..database import get_db
from ..models import User, PortfolioSettings
from ..services.github import GitHubService

# Load JWT configs from env
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtsecretkeychangeinproduction12345")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    """
    Dependency to validate JWT and return the current logged-in user.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials - user_id missing",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

@router.get("/login-url")
def get_login_url():
    """
    Return the URL to redirect the user to GitHub for authentication.
    """
    url = GitHubService.get_auth_url()
    return {"url": url}

@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle GitHub redirect callback.
    Exchange code for access token, register/update user, and generate JWT.
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
        # Create / Register new user
        user = User(
            github_id=github_id,
            username=username,
            name=name,
            email=email,
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
        user.username = username
        user.name = name
        user.email = email
        user.avatar_url = avatar_url
        user.access_token = access_token
        db.commit()
        db.refresh(user)

    # 4. Generate JWT token
    token_data = {"user_id": user.id, "username": user.username}
    jwt_token = create_jwt_token(token_data)

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "email": user.email
        }
    }

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
        "email": current_user.email
    }
