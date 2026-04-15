# Tanit Talent AI

Full-stack recruitment platform: **React (Vite) + Express + Prisma + PostgreSQL + FastAPI** (AI microservice).

## Prerequisites

- Node.js 22+
- PostgreSQL 16+ with a database named **`tanit`**
- Python 3.12+ (for the AI service)

### Database

Create the database (name matches Prisma `DATABASE_URL`):

```sql
CREATE DATABASE tanit;
```

Default local connection (see `backend/.env`):

`postgresql://postgres:admin@localhost:1234/tanit`

## Quick start (local)

### 1. Backend

```bash
cd backend
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API: `http://localhost:3001` — health: `GET /health`

### User space API contract

- `POST /api/auth/register` (roles accepted: `candidat`, `recruteur`, `admin`)
- `POST /api/auth/login`
- `GET /api/users/me` (JWT required)
- `PUT /api/users/me` (JWT required)
- `GET /api/users` (admin only)
- `DELETE /api/users/:id` (admin only)

### 2. AI service (FastAPI)

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional: copy `ai-service/.env.example` to `ai-service/.env` and set **`OPENROUTER_API_KEY`** ([OpenRouter](https://openrouter.ai/)) so the chat widget uses a real LLM instead of the built-in rule-based replies. You can set **`OPENROUTER_MODEL`** (e.g. `openai/gpt-4o-mini`).

### 3. Frontend

```bash
cd frontend
npm ci
npm run dev
```

App: `http://localhost:5173` — API calls are proxied to the backend in dev.

Optional: `frontend/.env` with `VITE_API_URL=http://localhost:3001` (Socket.io + absolute API if needed).

## Demo accounts (after seed)

| Role     | Email                 | Password     |
|----------|----------------------|--------------|
| Employer | employer@tanit.demo  | password123  |
| Candidate| candidate@tanit.demo | password123  |

## Docker Compose

With Docker installed:

```bash
docker compose up --build
```

Services: Postgres (`tanit`), FastAPI, backend, frontend. A single gateway (nginx) is exposed on `http://localhost:3000` and routes the SPA + API on the same port. Adjust `JWT_SECRET` and CORS for production.

## Project layout

- `frontend/` — React 18, Tailwind v4, Radix/shadcn-style UI, Zustand, TanStack Query, Framer Motion, Socket.io client
- `backend/` — Express 5, JWT in httpOnly cookies, Prisma 5, Multer (PDF CV), Socket.io
- `ai-service/` — FastAPI: `/score`, `/match`, `/chat`, `/suggestions/:userId`
