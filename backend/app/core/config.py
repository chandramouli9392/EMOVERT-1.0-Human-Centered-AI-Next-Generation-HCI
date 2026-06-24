from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "EMOVERT API"

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://emovert.vercel.app"
    ]

    # SQLite for local MVP
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./emovert.db"
    )

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "your-super-secret-jwt-key-change-in-production"
    )

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID",
        ""
    )

    class Config:
        env_file = ".env"


settings = Settings()
