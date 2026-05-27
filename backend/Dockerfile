FROM python:3.12-slim

# Create a non-root user so the process does not run as root
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Install dependencies in a separate layer for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Hand ownership to the non-root user
RUN chown -R app:app /app
USER app

EXPOSE 8000

# Run migrations then start the server (no --reload in production)
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2"]
