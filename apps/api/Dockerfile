# Build context: thư mục gốc repo  (docker build -f apps/api/Dockerfile .)
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /usr/local/bin/uv
WORKDIR /src
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY pyproject.toml uv.lock ./
COPY packages/laso-engine packages/laso-engine
COPY apps/api apps/api
COPY services/ai-engine/pyproject.toml services/ai-engine/pyproject.toml
RUN uv sync --frozen --no-dev --package tuvi-api --no-editable

FROM python:3.12-slim
RUN useradd --create-home --uid 1000 app
WORKDIR /app
COPY --from=builder /src/.venv /app/.venv
COPY apps/api/app /app/app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app
EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
