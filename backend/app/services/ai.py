from app.models.models import Course, Enrollment, LessonProgress


def build_hint(topic: str, question: str) -> str:
    return (
        f"Focus on '{topic}': break the problem into small steps, answer one step at a time, "
        f"then validate your result against the question '{question[:90]}'."
    )


def summarize_content(content: str) -> str:
    clean = " ".join(content.split())
    if len(clean) <= 220:
        return clean
    return f"{clean[:220]}..."


def generate_simple_quiz(content: str) -> list[dict]:
    topic = content.split(".")[0][:60] if content else "this lesson"
    return [
        {
            "id": 1,
            "prompt": f"What is the main objective of {topic}?",
            "choices": ["Understand core concept", "Ignore fundamentals", "Skip practice", "Avoid feedback"],
            "answer": "Understand core concept",
        },
        {
            "id": 2,
            "prompt": "What should you do after learning a concept?",
            "choices": ["Apply it with practice", "Forget it", "Only read theory", "Change topic immediately"],
            "answer": "Apply it with practice",
        },
    ]


def recommend_courses_for_user(
    user_id: int,
    courses: list[Course],
    enrollments: list[Enrollment],
    progress_entries: list[LessonProgress],
) -> list[dict]:
    enrolled_course_ids = {en.course_id for en in enrollments if en.user_id == user_id}
    completed_by_enrollment = {}
    for progress in progress_entries:
        completed_by_enrollment.setdefault(progress.enrollment_id, 0)
        if progress.completed:
            completed_by_enrollment[progress.enrollment_id] += 1

    ranking = []
    for course in courses:
        is_enrolled = course.id in enrolled_course_ids
        score = 0
        if not is_enrolled:
            score += 50
        score += len(course.lessons) * 2
        ranking.append(
            {
                "course_id": course.id,
                "title": course.title,
                "reason": "Great next roadmap step based on your progress",
                "score": score,
            }
        )

    ranking.sort(key=lambda item: item["score"], reverse=True)
    return ranking[:5]
