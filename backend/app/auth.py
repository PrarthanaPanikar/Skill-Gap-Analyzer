"""Firebase ID-token verification. The frontend signs in with Google via Firebase
and sends the ID token as `Authorization: Bearer <token>`."""
import firebase_admin
from fastapi import Depends, Header, HTTPException
from firebase_admin import auth as fb_auth
from firebase_admin import credentials
from sqlalchemy.orm import Session

from app.config import settings
from app.db import User, get_db


def _init_firebase() -> None:
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(settings.firebase_credentials))


def verify_token(token: str) -> dict:
    _init_firebase()
    try:
        return fb_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired sign-in. Please sign in again.")


def current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Sign in required.")
    claims = verify_token(authorization.split(" ", 1)[1])
    user = db.query(User).filter_by(firebase_uid=claims["uid"]).first()
    if not user:  # first sign-in == registration
        user = User(
            firebase_uid=claims["uid"],
            email=claims.get("email", ""),
            name=claims.get("name", ""),
            photo_url=claims.get("picture", ""),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
