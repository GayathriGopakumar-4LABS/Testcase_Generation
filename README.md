# QA Test Case Generator

An AI-powered SaaS platform that generates comprehensive QA test cases from plain-English requirements using Google Gemini.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL, Alembic |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Auth | JWT (python-jose + passlib bcrypt) |

---

## Features

- **Auth** — Register, login, JWT-protected routes
- **Projects** — Create, edit, delete projects to group test generations
- **AI Generation** — Describe a requirement → Gemini returns 5–10 structured test cases
- **History** — Full searchable/filterable history of all generations, grouped by project
- **Export** — JSON, CSV, Markdown export per generation
- **Dashboard** — Stats overview and quick-action shortcuts

---

## Project Structure

```
qa-test-generator/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/      # FastAPI route handlers
│   │   ├── core/               # Config, security, JWT dependencies
│   │   ├── db/                 # SQLAlchemy engine + session
│   │   ├── models/             # ORM models (User, Project, Generation)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic
│   │   │   └── ai/             # AI provider abstraction + Gemini impl
│   │   └── prompts/            # System prompts & user prompt builders
│   ├── alembic/                # Database migrations
│   ├── main.py                 # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (auth)/             # Login & register pages
│   │   └── (dashboard)/        # Protected dashboard pages
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── layout/             # Sidebar, header
│   │   ├── auth/               # Login/register forms
│   │   ├── projects/           # Project cards & dialogs
│   │   ├── generate/           # Generation form & results
│   │   └── history/            # History list & filters
│   ├── hooks/                  # TanStack Query + mutation hooks
│   ├── lib/api/                # Axios API client layer
│   ├── store/                  # Zustand auth store
│   └── types/                  # Shared TypeScript types
└── docker-compose.yml
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)

---

### 1. Start PostgreSQL

**Option A — Docker (recommended)**

```bash
docker-compose up db -d
```

**Option B — local PostgreSQL**

```sql
CREATE DATABASE qa_generator;
```

---

### 2. Backend

```bash
cd backend

# Create and activate virtualenv
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and GOOGLE_API_KEY

# Run database migrations
alembic upgrade head

# Start the API server
python dev.py

# To run backend
uvicorn main:app --reload
```

API docs available at: http://localhost:8000/docs

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start the dev server
npm run dev
```

App available at: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://postgres:password@localhost:5432/qa_generator` |
| `SECRET_KEY` | JWT signing secret (change in production!) | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes | `1440` (24h) |
| `GOOGLE_API_KEY` | Google Gemini API key | — |
| `CORS_ORIGINS` | JSON array of allowed origins | `["http://localhost:3000"]` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and get JWT token |
| `GET` | `/api/v1/auth/me` | Get current user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects/` | List all projects |
| `POST` | `/api/v1/projects/` | Create a project |
| `GET` | `/api/v1/projects/{id}` | Get a project |
| `PUT` | `/api/v1/projects/{id}` | Update a project |
| `DELETE` | `/api/v1/projects/{id}` | Delete a project |

### Generations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/generations/` | Generate test cases via Gemini |
| `GET` | `/api/v1/generations/` | List generations (supports `?search=`, `?project_id=`, `?test_type=`) |
| `GET` | `/api/v1/generations/{id}` | Get a generation with full test cases |
| `DELETE` | `/api/v1/generations/{id}` | Delete a generation |
| `GET` | `/api/v1/generations/{id}/export/json` | Export as JSON |
| `GET` | `/api/v1/generations/{id}/export/csv` | Export as CSV |
| `GET` | `/api/v1/generations/{id}/export/markdown` | Export as Markdown |

---

## Architecture Decisions

### AI Provider Abstraction

`BaseAIProvider` in `backend/app/services/ai/base_provider.py` defines the interface. `GeminiProvider` implements it. To swap in a different AI provider (OpenAI, Anthropic, etc.), implement `BaseAIProvider` and inject it into `PromptService`.

### Structured JSON from Gemini

The model is configured with `response_mime_type="application/json"` and a low temperature (0.3) to maximize JSON validity. The `_parse` method in `GeminiProvider` handles any accidental markdown wrapping as a safety net.

### Client-side Auth Guard

The dashboard layout uses a 50ms `setTimeout` to allow Zustand's `persist` middleware to hydrate from `localStorage` before checking auth state. This avoids a flash-of-redirect on page refresh.

### Formatter Service

`FormatterService` is a pure utility class — no DB access, no AI calls. It converts a list of test-case dicts into JSON / CSV / Markdown. Kept separate so it can be used in both the API export endpoints and any future background jobs.

---

## Running with Docker Compose

```bash
# Copy and edit environment
cp backend/.env.example backend/.env
# Set GOOGLE_API_KEY in backend/.env

# Build and start everything
docker-compose up --build

# Run migrations (first time)
docker-compose exec backend alembic upgrade head
```

---

## Production Checklist

- [ ] Change `SECRET_KEY` to a cryptographically random 32+ char string
- [ ] Set `CORS_ORIGINS` to your actual frontend domain
- [ ] Use a managed PostgreSQL service (RDS, Supabase, etc.)
- [ ] Store `GOOGLE_API_KEY` in a secrets manager
- [ ] Enable HTTPS (reverse proxy via nginx / Caddy)
- [ ] Set `ACCESS_TOKEN_EXPIRE_MINUTES` to a sensible value for your security policy
