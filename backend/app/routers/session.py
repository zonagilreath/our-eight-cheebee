from fastapi import APIRouter

from app.ecb.client import ecb_client
from app.models.list_item import SessionStatus

router = APIRouter(prefix="/session", tags=["session"])


@router.get("/status", response_model=SessionStatus)
async def session_status() -> SessionStatus:
    return await ecb_client.get_session_status()


@router.post("/refresh")
async def refresh_session():
    success = await ecb_client.refresh_session()
    return {"success": success}
