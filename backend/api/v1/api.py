# backend/api/v1/api.py
from fastapi import APIRouter
from api.v1.endpoints import auth, assets

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(assets.router, prefix="/assets", tags=["assets"])