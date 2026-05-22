from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generation import Generation
from app.models.project import Project
from app.schemas.generation import GenerationCreate
from app.services.ai.base_provider import AIProviderError, AIProviderQuotaError
from app.services.ai.prompt_service import PromptService


class GenerationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self._prompt_service = PromptService()

    async def create_generation(self, data: GenerationCreate, user_id: str) -> Generation:
        # Verify that the project belongs to this user
        result = await self.db.execute(
            select(Project).where(Project.id == data.project_id, Project.owner_id == user_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        try:
            test_cases = await self._prompt_service.generate_test_cases(
                requirement=data.requirement,
                test_type=data.test_type,
            )
        except AIProviderQuotaError as exc:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=str(exc),
            ) from exc
        except AIProviderError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc

        generation = Generation(
            title=data.title,
            requirement=data.requirement,
            test_type=data.test_type,
            test_cases=test_cases,
            test_case_count=len(test_cases),
            project_id=data.project_id,
            user_id=user_id,
        )
        self.db.add(generation)
        await self.db.commit()
        await self.db.refresh(generation)
        return generation

    async def list_generations(
        self,
        user_id: str,
        project_id: Optional[str] = None,
        search: Optional[str] = None,
        test_type: Optional[str] = None,
    ) -> List[Generation]:
        query = select(Generation).where(Generation.user_id == user_id)

        if project_id:
            query = query.where(Generation.project_id == project_id)
        if search:
            query = query.where(
                or_(
                    Generation.title.ilike(f"%{search}%"),
                    Generation.requirement.ilike(f"%{search}%"),
                )
            )
        if test_type:
            query = query.where(Generation.test_type == test_type)

        result = await self.db.execute(query.order_by(Generation.created_at.desc()))
        return list(result.scalars().all())

    async def get_generation(self, generation_id: str, user_id: str) -> Generation:
        result = await self.db.execute(
            select(Generation).where(
                Generation.id == generation_id, Generation.user_id == user_id
            )
        )
        gen = result.scalar_one_or_none()
        if not gen:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
        return gen

    async def delete_generation(self, generation_id: str, user_id: str) -> None:
        gen = await self.get_generation(generation_id, user_id)
        await self.db.delete(gen)
        await self.db.commit()
