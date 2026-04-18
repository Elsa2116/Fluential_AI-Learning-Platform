# Frontend (Next.js)

This is a Next.js App Router frontend for the AI learning platform.

## Run locally

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env.local
```

3. Start dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Pages

- `/` home
- `/login` login page
- `/register` register page
- `/dashboard` learning overview
- `/courses` course catalog + AI summary/quiz generation
- `/chat` AI chat page
- `/ai-tutor` AI tutor page
- `/progress` progress summary + recommendation
- `/quiz` short assessment

## Integrated Features

- User authentication UI (login/register)
- Course listing from API
- AI tutor/chat interaction
- Personalized recommendations
- Lesson summarization UI
- Dynamic quiz generation UI
