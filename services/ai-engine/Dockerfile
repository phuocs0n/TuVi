# Build context: thư mục gốc repo  (docker build -f services/ai-engine/Dockerfile .)
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /usr/local/bin/uv
WORKDIR /src
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY pyproject.toml uv.lock ./
COPY packages/laso-engine/pyproject.toml packages/laso-engine/pyproject.toml
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY services/ai-engine services/ai-engine
RUN uv sync --frozen --no-dev --package tuvi-ai-engine --no-editable

FROM python:3.12-slim
RUN useradd --create-home --uid 1000 app
WORKDIR /app
COPY --from=builder /src/.venv /app/.venv
COPY services/ai-engine/app /app/app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app
EXPOSE 8001
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
