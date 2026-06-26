from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    github_id = Column(Integer, unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    access_token = Column(String, nullable=True)  # GitHub access token
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    portfolio_settings = relationship("PortfolioSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")

class PortfolioSettings(Base):
    __tablename__ = "portfolio_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    theme_name = Column(String, default="dark-neon")  # default theme
    layout_style = Column(String, default="modern")

    # Relationships
    user = relationship("User", back_populates="portfolio_settings")

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    github_repo_id = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    html_url = Column(String, nullable=False)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    language = Column(String, nullable=True)
    topics = Column(String, default="[]")  # Stored as JSON string
    is_pinned = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="repositories")
