import json

from golden_gen import GOLDEN, build


def test_golden_json_khop_engine() -> None:
    """Sửa engine Python mà quên sinh lại golden.json (làm bản TypeScript lệch) sẽ bị chặn ở đây."""
    assert GOLDEN.exists(), "Chạy: uv run python packages/laso-engine/tests/golden_gen.py"
    assert json.loads(GOLDEN.read_text(encoding="utf-8")) == build()
