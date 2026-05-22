from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.generation import GenerationCreate, GenerationListItem, GenerationResponse
from app.services.ai.formatter_service import FormatterService
from app.services.generation_service import GenerationService

router = APIRouter()
_formatter = FormatterService()


@router.post("", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def create_generation(
    data: GenerationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate test cases from a requirement using Gemini AI and persist the result."""
    return await GenerationService(db).create_generation(data, current_user.id)


@router.get("", response_model=List[GenerationListItem])
async def list_generations(
    project_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    test_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await GenerationService(db).list_generations(
        current_user.id, project_id=project_id, search=search, test_type=test_type
    )


@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await GenerationService(db).get_generation(generation_id, current_user.id)


@router.delete("/{generation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await GenerationService(db).delete_generation(generation_id, current_user.id)


# ── Export endpoints ──────────────────────────────────────────────────────────

@router.get("/{generation_id}/export/json")
async def export_json(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = await GenerationService(db).get_generation(generation_id, current_user.id)
    return Response(
        content=_formatter.to_json(gen.test_cases),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{gen.title}.json"'},
    )


@router.get("/{generation_id}/export/csv")
async def export_csv(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = await GenerationService(db).get_generation(generation_id, current_user.id)
    return Response(
        content=_formatter.to_csv(gen.test_cases, gen.title),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{gen.title}.csv"'},
    )


@router.get("/{generation_id}/export/markdown")
async def export_markdown(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = await GenerationService(db).get_generation(generation_id, current_user.id)
    return Response(
        content=_formatter.to_markdown(gen.test_cases, gen.title),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{gen.title}.md"'},
    )
