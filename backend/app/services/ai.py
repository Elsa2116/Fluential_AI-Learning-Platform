import json

import httpx

from app.core.config import settings
from app.models.models import Course, Enrollment, LessonProgress


def model_is_configured() -> bool:
    return bool(settings.llm_api_key and settings.llm_model and settings.llm_base_url)


def _is_gemini_provider() -> bool:
    return "generativelanguage.googleapis.com" in settings.llm_base_url.lower()


def _generate_with_model(system_prompt: str, user_prompt: str, max_tokens: int = 250) -> str:
    if _is_gemini_provider():
        endpoint = f"{settings.llm_base_url.rstrip('/')}/models/{settings.llm_model}:generateContent"
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": max_tokens,
            },
        }
        headers = {
            "x-goog-api-key": settings.llm_api_key,
            "Content-Type": "application/json",
        }
    else:
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

    if _is_gemini_provider():
        candidates = data.get("candidates", [])
        if not candidates:
            raise ValueError("Gemini returned no candidates")
        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise ValueError("Gemini returned empty content")
        text = "".join(part.get("text", "") for part in parts).strip()
        if not text:
            raise ValueError("Gemini returned empty text")
        return text

    return data["choices"][0]["message"]["content"].strip()


def build_hint(topic: str, question: str) -> str:
    if not model_is_configured():
        raise ValueError(
            "Real AI is not configured. Set LLM_API_KEY, LLM_MODEL, and LLM_BASE_URL in backend environment variables."
        )

    try:
        return _generate_with_model(
            "You are a concise and practical learning tutor.",
            (
                f"Topic: {topic}\n"
                f"Question: {question}\n"
                "Answer with a clear and accurate explanation for a learner. "
                "Keep it concise, include one concrete example, and end with one practical next step."
            ),
        )
    except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
        raise ValueError(
            "Real AI request failed. Check your API key, model name, and provider base URL."
        ) from exc


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


def _rule_based_recommendations(
    user_id: int,
    courses: list[Course],
    enrollments: list[Enrollment],
    progress_entries: list[LessonProgress],
) -> list[dict]:
    enrolled_course_ids = {en.course_id for en in enrollments if en.user_id == user_id}

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


def _ai_recommendations(
    user_id: int,
    courses: list[Course],
    enrollments: list[Enrollment],
    progress_entries: list[LessonProgress],
) -> list[dict]:
    course_lookup = {course.id: course for course in courses}
    enrolled_ids = {en.course_id for en in enrollments if en.user_id == user_id}
    enrollment_ids_for_user = {en.id for en in enrollments if en.user_id == user_id}

    completed_count_by_course: dict[int, int] = {}
    for progress in progress_entries:
        if progress.enrollment_id in enrollment_ids_for_user and progress.completed:
            lesson = progress.lesson
            if lesson and lesson.course_id:
                completed_count_by_course[lesson.course_id] = (
                    completed_count_by_course.get(lesson.course_id, 0) + 1
                )

    catalog_payload = [
        {
            "course_id": course.id,
            "title": course.title,
            "description": course.description[:220] if course.description else "",
            "lesson_count": len(course.lessons),
            "is_enrolled": course.id in enrolled_ids,
            "completed_lessons": completed_count_by_course.get(course.id, 0),
        }
        for course in courses
    ]

    raw = _generate_with_model(
        "You are an educational recommendation engine. Return only valid JSON.",
        (
            f"User id: {user_id}\n"
            "Recommend up to 5 courses from the catalog. Prioritize practical next steps and avoid repetition.\n"
            "Return ONLY a JSON array of objects with keys: course_id, reason, score.\n"
            "- course_id must be from catalog\n"
            "- reason must be one short sentence\n"
            "- score must be integer 0-100\n\n"
            f"Catalog: {json.dumps(catalog_payload)}"
        ),
        max_tokens=700,
    )

    parsed = json.loads(raw)
    if not isinstance(parsed, list):
        raise ValueError("Invalid AI recommendation payload")

    normalized = []
    seen_ids = set()
    for item in parsed:
        if not isinstance(item, dict):
            continue

        course_id = item.get("course_id")
        if not isinstance(course_id, int) or course_id not in course_lookup or course_id in seen_ids:
            continue

        reason = item.get("reason")
        if not isinstance(reason, str) or not reason.strip():
            reason = "Recommended based on your learning progress."

        score = item.get("score", 60)
        try:
            score = int(score)
        except (TypeError, ValueError):
            score = 60

        score = max(0, min(100, score))
        normalized.append(
            {
                "course_id": course_id,
                "title": course_lookup[course_id].title,
                "reason": reason.strip(),
                "score": score,
            }
        )
        seen_ids.add(course_id)

    if not normalized:
        raise ValueError("AI returned no usable recommendations")

    normalized.sort(key=lambda item: item["score"], reverse=True)
    return normalized[:5]


def recommend_courses_for_user(
    user_id: int,
    courses: list[Course],
    enrollments: list[Enrollment],
    progress_entries: list[LessonProgress],
) -> list[dict]:
    if model_is_configured():
        try:
            return _ai_recommendations(user_id, courses, enrollments, progress_entries)
        except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
            pass

    return _rule_based_recommendations(user_id, courses, enrollments, progress_entries)
