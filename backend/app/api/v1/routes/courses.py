from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Course, Lesson, User
from app.schemas.schemas import CourseCreate, CourseListItem, CourseUpdate

router = APIRouter(tags=["courses"])


@router.get("/courses", response_model=list[CourseListItem])
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return [
        CourseListItem(
            id=course.id,
            title=course.title,
            description=course.description,
            teacher_id=course.teacher_id,
            lesson_count=len(course.lessons),
        )
        for course in courses
    ]


@router.post("/courses")
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == payload.teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=400, detail="teacher_id must belong to a teacher account")

    course = Course(
        title=payload.title,
        description=payload.description,
        teacher_id=payload.teacher_id,
        is_published=payload.is_published,
    )
    db.add(course)
    db.flush()

    for lesson in payload.lessons:
        db.add(
            Lesson(
                course_id=course.id,
                title=lesson.title,
                content=lesson.content,
                step_order=lesson.step_order,
            )
        )

    db.commit()
    db.refresh(course)
    return {"id": course.id, "message": "Course created"}


@router.patch("/courses/{course_id}")
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "message": "Course updated"}


@router.post("/courses/{course_id}/lessons")
def add_lesson(course_id: int, payload: dict, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    required = {"title", "content", "step_order"}
    if not required.issubset(payload.keys()):
        raise HTTPException(status_code=400, detail="title, content, step_order are required")

    lesson = Lesson(
        course_id=course_id,
        title=payload["title"],
        content=payload["content"],
        step_order=int(payload["step_order"]),
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return {"id": lesson.id, "message": "Lesson added"}


@router.get("/courses/{course_id}/roadmap")
def course_roadmap(course_id: int, user_id: int, db: Session = Depends(get_db)):
    from app.models.models import Enrollment, LessonProgress

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="User must enroll first")

    progress_rows = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id)
        .all()
    )
    completed_ids = {p.lesson_id for p in progress_rows if p.completed}

    lessons = sorted(course.lessons, key=lambda item: item.step_order)
    roadmap = []
    first_incomplete_found = False
    for lesson in lessons:
        if lesson.id in completed_ids:
            status = "completed"
        elif not first_incomplete_found:
            status = "unlocked"
            first_incomplete_found = True
        else:
            status = "locked"
        roadmap.append(
            {
                "lesson_id": lesson.id,
                "title": lesson.title,
                "step_order": lesson.step_order,
                "status": status,
            }
        )

    return {"course_id": course_id, "roadmap": roadmap}
