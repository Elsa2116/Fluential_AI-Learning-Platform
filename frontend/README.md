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
- `/dashboard` backend health + overview
- `/lessons` lesson list
- `/ai-tutor` AI hint form
- `/progress` progress summary + recommendation
- `/quiz` short assessment
