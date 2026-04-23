from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Course, Enrollment, LessonProgress
from app.schemas.schemas import HintRequest, QuizRequest, SummaryRequest
from app.services.ai import (
    build_hint,
    generate_simple_quiz,
    recommend_courses_for_user,
    summarize_content,
)

router = APIRouter(tags=["ai"])


@router.post("/chat")
def ai_chat(payload: HintRequest):
    try:
        return {"hint": build_hint(payload.topic, payload.question)}
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/ai/hint")
def ai_hint(payload: HintRequest):
    try:
        return {"hint": build_hint(payload.topic, payload.question)}
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/recommend")
def recommend(user_id: int, db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    enrollments = db.query(Enrollment).all()
    progress_rows = db.query(LessonProgress).all()
    return recommend_courses_for_user(user_id, courses, enrollments, progress_rows)


@router.post("/summary")
def summary(payload: SummaryRequest):
    return {"summary": summarize_content(payload.content)}


@router.post("/quiz/generate")
def quiz_generate(payload: QuizRequest):
    return {"questions": generate_simple_quiz(payload.content)}
