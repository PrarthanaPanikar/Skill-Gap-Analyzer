from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./skillgap.db"
    firebase_credentials: str = "serviceAccount.json"
    ai_provider: str = "anthropic"
    model_name: str = "claude-sonnet-5-5"
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    cors_origins: str = "http://localhost:5173"
    max_upload_mb: int = 5
    roadmap_threshold: int = 50  # auto-generate roadmap below this match score


settings = Settings()
