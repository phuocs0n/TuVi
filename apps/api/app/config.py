from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_domain: str = "tuviai.id.vn"
    ai_engine_url: str = "http://ai-engine:8001"

    @field_validator("ai_engine_url")
    @classmethod
    def _them_scheme(cls, v: str) -> str:
        """Render cấp địa chỉ nội bộ dạng `host:port` (không có scheme)."""
        v = v.strip().rstrip("/")
        return v if v.startswith(("http://", "https://")) else f"http://{v}"


settings = Settings()
