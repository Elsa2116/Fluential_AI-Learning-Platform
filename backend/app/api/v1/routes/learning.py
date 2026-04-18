from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Course, Enrollment, Lesson, LessonProgress, User
from app.schemas.schemas import EnrollmentRequest, ProgressUpdateRequest

router = APIRouter(tags=["learning"])


@router.get("/lessons")
def list_lessons(db: Session = Depends(get_db)):
    lessons = db.query(Lesson).all()
    return [
        {
            "id": lesson.id,
            "course_id": lesson.course_id,
            "title": lesson.title,
            "step_order": lesson.step_order,
        }
        for lesson in lessons
    ]


@router.post("/enrollments")
def enroll(payload: EnrollmentRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not user or not course:
        raise HTTPException(status_code=404, detail="User or course not found")

    existing = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == payload.user_id, Enrollment.course_id == payload.course_id)
        .first()
    )
    if existing:
        return {"id": existing.id, "message": "Already enrolled"}

    enrollment = Enrollment(user_id=payload.user_id, course_id=payload.course_id)
    db.add(enrollment)
    db.flush()

    for lesson in course.lessons:
        db.add(
            LessonProgress(
                enrollment_id=enrollment.id,
                lesson_id=lesson.id,
                completed=False,
            )
        )

    db.commit()
    db.refresh(enrollment)
    return {"id": enrollment.id, "message": "Enrollment successful"}


@router.get("/courses/{course_id}/lessons/{lesson_id}")
def get_lesson_content(course_id: int, lesson_id: int, user_id: int, db: Session = Depends(get_db)):
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Enroll in this course first")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    previous_lesson = (
        db.query(Lesson)
        .filter(Lesson.course_id == course_id, Lesson.step_order < lesson.step_order)
        .order_by(Lesson.step_order.desc())
        .first()
    )
    if previous_lesson:
        previous_progress = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.enrollment_id == enrollment.id,
                LessonProgress.lesson_id == previous_lesson.id,
            )
            .first()
        )
        if previous_progress and not previous_progress.completed:
            raise HTTPException(status_code=423, detail="Complete previous lesson first")

    return {
        "id": lesson.id,
        "title": lesson.title,
        "content": lesson.content,
        "step_order": lesson.step_order,
    }


@router.patch("/progress")
def update_progress(payload: ProgressUpdateRequest, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == payload.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == payload.user_id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="User not enrolled in this course")

    progress = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == payload.lesson_id,
        )
        .first()
    )
    if not progress:
        progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=payload.lesson_id, completed=False)
        db.add(progress)

    progress.completed = payload.completed
    progress.completed_at = datetime.utcnow() if payload.completed else None
    db.commit()
    return {"message": "Progress updated"}


@router.get("/progress/{user_id}/{course_id}")
def progress_summary(user_id: int, course_id: int, db: Session = Depends(get_db)):
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.step_order).all()
    progress_rows = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id)
        .all()
    )
    completed_ids = {row.lesson_id for row in progress_rows if row.completed}
    completed_count = len(completed_ids)
    total = len(lessons)

    next_lesson_id = None
    for lesson in lessons:
        if lesson.id not in completed_ids:
            next_lesson_id = lesson.id
            break

    return {
        "course_id": course_id,
        "completed_lessons": completed_count,
        "total_lessons": total,
        "progress_percent": round((completed_count / total) * 100, 2) if total else 0,
        "next_lesson_id": next_lesson_id,
    }
