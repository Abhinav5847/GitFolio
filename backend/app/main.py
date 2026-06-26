from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, profile

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GitFolio API",
    description="Backend API for GitFolio auto-updating developer portfolios",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to GitFolio API!", "status": "online"}
