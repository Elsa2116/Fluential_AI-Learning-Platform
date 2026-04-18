from jose import JWTError
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import AuthResponse, AuthTokenResponse, LoginRequest, RegisterRequest
from app.services.auth import create_access_token, decode_access_token, hash_password, verify_password

router = APIRouter(tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

ALLOWED_ROLES = {"student", "teacher", "admin"}


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", "0"))
    except (JWTError, ValueError):
        raise unauthorized

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise unauthorized
    return user


@router.post("/register", response_model=AuthTokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(payload.email)
    normalized_role = payload.role.strip().lower()
    if normalized_role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name.strip(),
        email=normalized_email,
        hashed_password=hash_password(payload.password),
        country=payload.country.strip(),
        role=normalized_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _serialize_user(user)}


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(payload.email)
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _serialize_user(user)}


@router.get("/me", response_model=AuthResponse)
def current_user_profile(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)
