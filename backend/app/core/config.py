from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "Fluential Learning Platform API"
    api_prefix: str = "/api/v1"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./fluential.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = "HS256"

    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    llm_base_url: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")

    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    chapa_secret_key: str = os.getenv("CHAPA_SECRET_KEY", "")
    chapa_base_url: str = os.getenv("CHAPA_BASE_URL", "https://api.chapa.co/v1")
    payment_callback_base_url: str = os.getenv("PAYMENT_CALLBACK_BASE_URL", "http://localhost:8000")

    storage_dir: str = os.getenv("STORAGE_DIR", "app/uploads")


settings = Settings()
