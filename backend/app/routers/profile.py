from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..database import get_db
from ..models import User, PortfolioSettings
from .auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    twitter_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

@router.get("/")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = db.query(PortfolioSettings).filter(PortfolioSettings.user_id == current_user.id).first()
    
    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "username": current_user.username,
            "avatar_url": current_user.avatar_url,
        },
        "portfolio": {
            "bio": portfolio.bio if portfolio else "",
            "contact_email": portfolio.contact_email if portfolio else "",
            "twitter_url": portfolio.twitter_url if portfolio else "",
            "linkedin_url": portfolio.linkedin_url if portfolio else "",
            "website_url": portfolio.website_url if portfolio else "",
        }
    }

@router.put("/")
def update_profile(req: ProfileUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.name is not None:
        current_user.name = req.name

    portfolio = db.query(PortfolioSettings).filter(PortfolioSettings.user_id == current_user.id).first()
    if portfolio:
        if req.bio is not None:
            portfolio.bio = req.bio
        if req.contact_email is not None:
            portfolio.contact_email = req.contact_email
        if req.twitter_url is not None:
            portfolio.twitter_url = req.twitter_url
        if req.linkedin_url is not None:
            portfolio.linkedin_url = req.linkedin_url
        if req.website_url is not None:
            portfolio.website_url = req.website_url
    
    db.commit()
    return {"message": "Profile updated successfully"}
