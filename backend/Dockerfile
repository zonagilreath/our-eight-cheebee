# Python 3.11 + Playwright + Chromium + FastAPI (uvicorn)
# Targeting Fly.io: 1GB RAM recommended for Chromium session refresh.
FROM mcr.microsoft.com/playwright/python:v1.58.0-jammy

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    ECB_HEADLESS=true \
    UV_SYSTEM_PYTHON=1

# Install uv (fast Python package manager used in dev)
COPY --from=ghcr.io/astral-sh/uv:0.5.4 /uv /usr/local/bin/uv

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# App source
COPY app ./app

# Install the project itself (no editable to keep image small)
RUN uv sync --frozen --no-dev

EXPOSE 8000

# Auth.json must be mounted or created via `/session/refresh` on first boot.
# Fly volume recommended for /root/.texas-grocery-mcp persistence.
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
