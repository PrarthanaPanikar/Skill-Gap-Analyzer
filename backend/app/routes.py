from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.providers import get_llm
from app.auth import current_user
from app.config import settings
from app.db import Analysis, Target, User, get_db
from app.services import ats, gaps, parser, roadmap
from app.services.skills import get_role_profile, role_catalog

router = APIRouter()


class TargetIn(BaseModel):
    role: str = Field(min_length=2, max_length=120)
    companies: list[str] = Field(default_factory=list, max_length=5)


class RoadmapIn(BaseModel):
    timeline_weeks: int = Field(default=12, ge=2, le=52)


def _out(a: Analysis) -> dict:
    return {
        "id": a.id, "filename": a.filename, "role": a.role, "companies": a.companies,
        "match_score": a.match_score, "ats": a.ats, "skills": a.skills, "guidance": a.guidance,
        "roadmap": a.roadmap, "roadmap_recommended": a.match_score < settings.roadmap_threshold,
        "created_at": a.created_at.isoformat(),
    }


@router.post("/auth/session")
def session(user: User = Depends(current_user), db: Session = Depends(get_db)):
    target = db.get(Target, user.id)
    return {
        "user": {"id": user.id, "email": user.email, "name": user.name, "photo_url": user.photo_url},
        "target": {"role": target.role, "companies": target.companies} if target else None,
    }


@router.get("/meta/roles")
def roles():
    return list(role_catalog().keys())


@router.put("/profile/target")
def set_target(body: TargetIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    companies = [c.strip() for c in body.companies if c.strip()][:5]
    target = db.get(Target, user.id) or Target(user_id=user.id)
    target.role, target.companies = body.role.strip(), companies
    db.add(target)
    db.commit()
    return {"role": target.role, "companies": target.companies}


@router.post("/resume/analyze")
def analyze(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    target = db.get(Target, user.id)
    if not target:
        raise HTTPException(400, "Choose a target role and companies first.")
    data = file.file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File is larger than {settings.max_upload_mb} MB.")
    try:
        text = parser.extract_text(file.filename or "", data)
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception:
        raise HTTPException(422, "This file looks corrupted. Re-export it and try again.")

    llm = get_llm()
    sections = parser.split_sections(text)
    profile = get_role_profile(target.role, llm)
    items, match = gaps.skill_gaps(text, profile)
    result = Analysis(
        user_id=user.id, filename=file.filename or "resume", role=target.role,
        companies=target.companies, match_score=match,
        ats=ats.score(text, sections, profile, llm, target.role), skills=items,
        guidance=gaps.guidance(llm, target.role, target.companies, text, items, match),
    )
    if match < settings.roadmap_threshold:  # far from the goal: build the roadmap automatically
        result.roadmap = roadmap.build_roadmap(llm, target.role, target.companies, items, match, 12)
    db.add(result)
    db.commit()
    db.refresh(result)
    return _out(result)


def _owned(db: Session, user: User, analysis_id: int) -> Analysis:
    a = db.get(Analysis, analysis_id)
    if not a or a.user_id != user.id:
        raise HTTPException(404, "Analysis not found.")
    return a


@router.get("/analysis/latest")
def latest(user: User = Depends(current_user), db: Session = Depends(get_db)):
    a = db.query(Analysis).filter_by(user_id=user.id).order_by(Analysis.id.desc()).first()
    return _out(a) if a else None


@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return _out(_owned(db, user, analysis_id))


@router.post("/analysis/{analysis_id}/roadmap")
def make_roadmap(analysis_id: int, body: RoadmapIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    a = _owned(db, user, analysis_id)
    a.roadmap = roadmap.build_roadmap(get_llm(), a.role, a.companies, a.skills, a.match_score, body.timeline_weeks)
    db.commit()
    return a.roadmap
