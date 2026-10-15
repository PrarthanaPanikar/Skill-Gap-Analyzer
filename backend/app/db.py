from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "sg_users"
    id: Mapped[int] = mapped_column(primary_key=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), default="")
    name: Mapped[str] = mapped_column(String(255), default="")
    photo_url: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Target(Base):
    __tablename__ = "sg_targets"
    user_id: Mapped[int] = mapped_column(ForeignKey("sg_users.id"), primary_key=True)
    role: Mapped[str] = mapped_column(String(120))
    companies: Mapped[list] = mapped_column(JSON, default=list)


class Analysis(Base):
    __tablename__ = "sg_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("sg_users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(120))
    companies: Mapped[list] = mapped_column(JSON, default=list)
    match_score: Mapped[int] = mapped_column(Integer)
    ats: Mapped[dict] = mapped_column(JSON)
    skills: Mapped[list] = mapped_column(JSON)
    guidance: Mapped[dict] = mapped_column(JSON)
    roadmap: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
