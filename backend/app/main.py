import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import models  # noqa: F401

app = FastAPI(title=settings.app_name)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    os.makedirs(settings.storage_dir, exist_ok=True)


app.include_router(api_router, prefix=settings.api_prefix)
app.mount("/uploads", StaticFiles(directory=settings.storage_dir), name="uploads")


@app.get("/")
def health():
    return {"status": "ok", "service": settings.app_name}
