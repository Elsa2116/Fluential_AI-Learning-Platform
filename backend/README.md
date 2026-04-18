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

## Environment variables

Set these in your shell before running:

- `LLM_API_KEY` - API key for your chat model provider
- `LLM_MODEL` - model name (example: `gpt-4o-mini`)
- `LLM_BASE_URL` - chat API base URL (example: `https://api.openai.com/v1`)
- `CHAPA_SECRET_KEY` - Chapa secret key for real checkout and verification
- `CHAPA_BASE_URL` - defaults to `https://api.chapa.co/v1`
- `PAYMENT_CALLBACK_BASE_URL` - your backend public URL (example: `http://localhost:8000`)

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
  - `POST /payments/chapa/verify`
  - `GET /payments/chapa/callback?tx_ref=...`
  - `GET /payments/{transaction_id}`
  - `POST /payments/{transaction_id}/confirm`
- Chat:
  - `GET /chat/messages/{room_id}`
  - `POST /chat/messages` (multipart form)
  - `POST /chat/files` (multipart form with `file`)
  - `WS /chat/ws/{room_id}`
