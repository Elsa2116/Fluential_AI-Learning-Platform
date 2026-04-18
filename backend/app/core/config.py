from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "Fluential Learning Platform API"
    api_prefix: str = "/api/v1"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./fluential.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = "HS256"
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    chapa_secret_key: str = os.getenv("CHAPA_SECRET_KEY", "")
    storage_dir: str = os.getenv("STORAGE_DIR", "app/uploads")


settings = Settings()
