import json

import httpx

from app.core.config import settings
from app.models.models import Course, Enrollment, LessonProgress


def model_is_configured() -> bool:
    return bool(settings.llm_api_key and settings.llm_model and settings.llm_base_url)


def _generate_with_model(system_prompt: str, user_prompt: str, max_tokens: int = 250) -> str:
    endpoint = f"{settings.llm_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.llm_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": max_tokens,
    }
    headers = {"Authorization": f"Bearer {settings.llm_api_key}", "Content-Type": "application/json"}
    with httpx.Client(timeout=30.0) as client:
        response = client.post(endpoint, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"].strip()


def build_hint(topic: str, question: str) -> str:
    if model_is_configured():
        try:
            return _generate_with_model(
                "You are a concise and practical learning tutor.",
                (
                    f"Topic: {topic}\n"
                    f"Question: {question}\n"
                    "Give a short learning hint in 2-4 sentences with one clear next step."
                ),
            )
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            pass

    return (
        f"Focus on '{topic}': break the problem into small steps, answer one step at a time, "
        f"then validate your result against the question '{question[:90]}'."
    )


def summarize_content(content: str) -> str:
    if model_is_configured():
        try:
            return _generate_with_model(
                "You summarize educational content clearly for students.",
                (
                    "Summarize the following content in 4-6 concise bullet points. "
                    "Keep key concepts and remove filler.\n\n"
                    f"{content}"
                ),
                max_tokens=350,
            )
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            pass

    clean = " ".join(content.split())
    if len(clean) <= 220:
        return clean
    return f"{clean[:220]}..."


def generate_simple_quiz(content: str) -> list[dict]:
    if model_is_configured():
        try:
            raw = _generate_with_model(
                "You create short multiple-choice quizzes in valid JSON.",
                (
                    "Create exactly 3 multiple-choice questions from this content. "
                    "Return only JSON as an array of objects with keys: id, prompt, choices, answer. "
                    "Each choices must have 4 options and answer must match one choice exactly.\n\n"
                    f"{content}"
                ),
                max_tokens=600,
            )
            parsed = json.loads(raw)
            if isinstance(parsed, list) and parsed:
                return parsed
        except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
            pass

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
