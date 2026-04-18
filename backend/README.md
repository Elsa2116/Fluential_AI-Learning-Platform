# Backend (FastAPI)

FastAPI backend for the AI learning platform with:
- AI hint, summary, quiz generation, and recommendations
- Teacher course management (create/update + lessons)
- Student enrollment, lesson access control, roadmap progress
- Payment test integration flow (Chapa for Ethiopia, Stripe for international)
- Real-time chat with WebSocket + file sharing

## Run locally

1. Create and activate a Python virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Start server:
   - `uvicorn app.main:app --reload`

API base URL: `http://localhost:8000/api/v1`

## Key endpoints

- Auth: `POST /register`, `POST /login`
- Courses:
  - `GET /courses`
  - `POST /courses`
  - `PATCH /courses/{course_id}`
  - `POST /courses/{course_id}/lessons`
  - `GET /courses/{course_id}/roadmap?user_id=...`
- Learning:
  - `POST /enrollments`
  - `GET /courses/{course_id}/lessons/{lesson_id}?user_id=...`
  - `PATCH /progress`
  - `GET /progress/{user_id}/{course_id}`
- AI:
  - `POST /chat`
  - `POST /ai/hint`
  - `GET /recommend?user_id=...`
  - `POST /summary`
  - `POST /quiz/generate`
- Payments:
  - `POST /payments/initialize`
  - `POST /payments/{transaction_id}/confirm`
- Chat:
  - `GET /chat/messages/{room_id}`
  - `POST /chat/messages` (multipart form)
  - `POST /chat/files` (multipart form with `file`)
  - `WS /chat/ws/{room_id}`
