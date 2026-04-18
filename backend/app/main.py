import os
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import models  # noqa: F401

app = FastAPI(title=settings.app_name)
Base.metadata.create_all(bind=engine)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """Return a string detail so API clients that pass it to Error(message) stay readable."""
    parts: list[str] = []
    for err in exc.errors():
        loc = err.get("loc", ())
        loc_tail = [str(x) for x in loc if x not in ("body", "query", "path", "header")]
        loc_str = ".".join(loc_tail) if loc_tail else ""
        msg = err.get("msg", "Invalid value")
        if loc_str:
            parts.append(f"{loc_str}: {msg}")
        else:
            parts.append(msg)
    detail = "; ".join(parts) if parts else "Invalid request"
    return JSONResponse(status_code=422, content={"detail": detail})


def _http_detail_as_str(detail) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        parts: list[str] = []
        for item in detail:
            if isinstance(item, dict):
                msg = str(item.get("msg", item))
                loc = item.get("loc") or ()
                tail = ".".join(str(x) for x in loc if x not in ("body", "query", "path", "header"))
                parts.append(f"{tail}: {msg}" if tail else msg)
            else:
                parts.append(str(item))
        return "; ".join(parts) if parts else "Request failed"
    if isinstance(detail, dict):
        return str(detail.get("message") or detail.get("detail") or detail)
    return str(detail)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Always expose string detail for clients that do new Error(response.data.detail)."""
    message = _http_detail_as_str(exc.detail)
    headers = dict(exc.headers) if exc.headers else {}
    return JSONResponse(status_code=exc.status_code, content={"detail": message}, headers=headers)


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
os.makedirs(settings.storage_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.storage_dir), name="uploads")


@app.get("/")
def health():
    return {"status": "ok", "service": settings.app_name}
