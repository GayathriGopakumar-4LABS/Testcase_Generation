from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.generations import router as generations_router
from app.api.v1.routes.projects import router as projects_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(projects_router, prefix="/projects", tags=["Projects"])
router.include_router(generations_router, prefix="/generations", tags=["Generations"])
