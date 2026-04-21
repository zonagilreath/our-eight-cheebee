from pydantic import BaseModel


class SessionStatus(BaseModel):
    is_authenticated: bool
    needs_refresh: bool
    time_remaining_seconds: float | None = None
