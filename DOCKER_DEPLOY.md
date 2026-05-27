# Docker Deployment Guide — QA Test Case Generator

## Prerequisites

| Tool | Minimum version | Check |
|---|---|---|
| Docker Desktop (Windows/Mac) or Docker Engine (Linux) | 24.x | `docker --version` |
| Docker Compose plugin | 2.x | `docker compose version` |
| Google Gemini API key | — | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

> **Windows users:** Docker Desktop must be running before any `docker` command is used.

---

## Project structure (Docker-relevant files)

```
qa-test-generator/
├── docker-compose.yml          ← orchestrates all three services
├── backend/
│   ├── Dockerfile              ← Python / FastAPI image
│   ├── .dockerignore           ← excludes .venv, .env, __pycache__
│   └── .env.example            ← reference for required variables
└── frontend/
    ├── Dockerfile              ← multi-stage Next.js image
    └── .dockerignore           ← excludes node_modules, .env.local
```

---

## Step 1 — Clone / verify the project root

Open a terminal and navigate to the project folder:

```bash
cd qa-test-generator
```

Confirm you are in the right directory (you should see `docker-compose.yml`):

```bash
ls docker-compose.yml          # Linux / macOS / Git Bash
dir docker-compose.yml         # Windows CMD
```

---

## Step 2 — Create the environment file

Docker Compose reads a file named `.env` in the **project root** (the same folder as `docker-compose.yml`) to fill in variables like `${GOOGLE_API_KEY}`.

Create that file now:

**Linux / macOS / Git Bash**
```bash
cp backend/.env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item backend\.env.example .env
```

Now open `.env` in any text editor and fill in the three required values:

```dotenv
# ── Required ──────────────────────────────────────────────────────────────────

# Your Google Gemini API key (get one at https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=AIzaSy...your-key-here...

# A random secret used to sign JWT tokens — change this before going live
# Generate one: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=replace-with-a-random-32-plus-character-string

# Password for the PostgreSQL database created by Docker
DB_PASSWORD=choose-a-strong-password

# ── Optional overrides (defaults shown) ───────────────────────────────────────

# Gemini model to use
GEMINI_MODEL=gemini-1.5-flash

# URL the browser uses to reach the backend API
# Use http://localhost:8000/api/v1 for local Docker deployment
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

> **Never commit this `.env` file.** It is already listed in `.gitignore`.

---

## Step 3 — Build the images

This step downloads base images, installs all dependencies, and compiles the
Next.js frontend. It only needs to run once, and again whenever you change
source code or dependencies.

```bash
docker compose build
```

Expected output (abbreviated):

```
[+] Building ...
 => [db] — pulled from library/postgres
 => [backend] python:3.12-slim — pulled
 => [backend] pip install -r requirements.txt — done
 => [frontend] node:20-alpine — pulled
 => [frontend] npm ci — done
 => [frontend] npm run build — done
```

The frontend build takes the longest (~2–4 minutes on first run) because
`npm ci` installs all packages from scratch.

---

## Step 4 — Start all services

```bash
docker compose up -d
```

The `-d` flag runs the containers in the background (detached mode).

Docker Compose starts services in dependency order:

1. **`db`** starts first and waits until PostgreSQL is ready (health-check).
2. **`backend`** starts next — it automatically runs `alembic upgrade head`
   to create all database tables, then starts the FastAPI server.
3. **`frontend`** starts last.

Wait about 30 seconds after running the command for everything to initialise.

---

## Step 5 — Verify all three containers are running

```bash
docker compose ps
```

You should see all three containers with status `running` or `Up`:

```
NAME                     STATUS          PORTS
qa_generator_db          Up (healthy)    0.0.0.0:5432->5432/tcp
qa_generator_backend     Up              0.0.0.0:8000->8000/tcp
qa_generator_frontend    Up              0.0.0.0:3000->3000/tcp
```

If any service shows `Exit` or `Restarting`, check the logs (see Step 6).

---

## Step 6 — Check the logs

**All services at once:**
```bash
docker compose logs -f
```

**One service at a time:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Press `Ctrl + C` to stop following.

### What healthy startup looks like

**backend:**
```
INFO  [alembic.runtime.migration] Running upgrade ...
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**frontend:**
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

---

## Step 7 — Open the application

| Service | URL |
|---|---|
| **Web app** | [http://localhost:3000](http://localhost:3000) |
| **API docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **API health check** | [http://localhost:8000/health](http://localhost:8000/health) |

Open `http://localhost:3000` in your browser, register an account, and start
generating test cases.

---

## Day-to-day commands

### Stop the application (keeps data)

```bash
docker compose down
```

### Start again after stopping

```bash
docker compose up -d
```

### Rebuild after a code change

```bash
docker compose build
docker compose up -d
```

Or combine both steps:

```bash
docker compose up -d --build
```

### View real-time logs

```bash
docker compose logs -f
```

### Stop and remove everything including the database volume

> ⚠️ This permanently deletes all stored data (users, projects, test cases).

```bash
docker compose down -v
```

---

## Troubleshooting

### `docker compose` not found

You have the older standalone `docker-compose` (v1). Use it instead:

```bash
docker-compose build
docker-compose up -d
```

---

### Backend exits immediately on startup

```bash
docker compose logs backend
```

**"Connection refused" or "could not connect to server"**
The database container wasn't ready in time. Try:
```bash
docker compose restart backend
```

**"GOOGLE_API_KEY is missing" or empty**
The `.env` file in the project root is missing or the key is blank.
Check it with:
```bash
cat .env | grep GOOGLE_API_KEY     # Linux/macOS
type .env | findstr GOOGLE_API_KEY # Windows CMD
```

---

### Frontend build fails with "not found: package-lock.json"

Run `npm install` locally first to generate the lock file, then rebuild:

```bash
cd frontend
npm install
cd ..
docker compose build frontend
```

---

### `502 Bad Gateway` when generating test cases

The Gemini API key is invalid, expired, or the free-tier quota is exhausted.

1. Verify the key is active at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Check the backend logs for the exact error message:
   ```bash
   docker compose logs backend | grep -i "gemini\|error\|502"
   ```
3. If quota is exhausted, wait until the daily limit resets or switch to
   `GEMINI_MODEL=gemini-1.5-flash` in `.env`, then restart:
   ```bash
   docker compose up -d --force-recreate backend
   ```

---

### Port already in use (3000 or 8000)

Another process is using that port. Either stop that process or change the
host port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"   # frontend now available at localhost:3001
```

---

### Check which image versions are running

```bash
docker compose images
```

---

## What each service does inside Docker

| Service | Image | What runs inside |
|---|---|---|
| `db` | `postgres:16-alpine` | PostgreSQL database; data is persisted in the `postgres_data` named volume |
| `backend` | Built from `backend/Dockerfile` | Runs `alembic upgrade head` (migrations) then `uvicorn` with 2 workers on port 8000 |
| `frontend` | Built from `frontend/Dockerfile` | Multi-stage build; runs `node server.js` (Next.js standalone) on port 3000 |

---

## Data persistence

The database volume `postgres_data` survives `docker compose down` and
`docker compose up` cycles. Your users, projects, and generated test cases
are not lost between restarts.

The volume is only removed when you explicitly run `docker compose down -v`.
