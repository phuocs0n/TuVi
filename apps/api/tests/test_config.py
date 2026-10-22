import pytest

from app.config import Settings


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("tuvi-ai-engine:8001", "http://tuvi-ai-engine:8001"),
        ("http://ai-engine:8001", "http://ai-engine:8001"),
        ("https://ai.example.com/", "https://ai.example.com"),
        ("  host:10000 ", "http://host:10000"),
    ],
)
def test_ai_engine_url_tu_them_scheme(
    monkeypatch: pytest.MonkeyPatch, raw: str, expected: str
) -> None:
    monkeypatch.setenv("AI_ENGINE_URL", raw)
    assert Settings().ai_engine_url == expected
