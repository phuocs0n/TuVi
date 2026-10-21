# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm! Quy trình đầy đủ: [docs/GIT_WORKFLOW_CICD.md](docs/GIT_WORKFLOW_CICD.md).

## Bắt đầu

```bash
git checkout develop && git pull
git checkout -b feature/<issue>-<mo-ta-ngan>
uv sync --all-packages && pnpm install
pip install pre-commit && pre-commit install --hook-type pre-commit --hook-type commit-msg
```

## Quy tắc

- Commit theo [Conventional Commits](https://www.conventionalcommits.org/): `feat(laso): ...`, `fix(api): ...`.
- Mở PR vào **`develop`**, điền mẫu PR; CI phải xanh.
- Sửa `packages/laso-engine` thì bắt buộc kèm test (coverage ≥ 80%).
- **Không** commit `.env`, API key hay dữ liệu cá nhân. Thêm biến mới phải cập nhật `.env.example`.

## Kiểm tra trước khi push

```bash
ruff check . && ruff format --check .
uv run mypy apps/api/app
(cd packages/laso-engine && uv run pytest)
pnpm -r lint && pnpm -r typecheck
```
