from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_project(self, data: ProjectCreate, owner_id: str) -> Project:
        project = Project(name=data.name, description=data.description, owner_id=owner_id)
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def list_projects(self, owner_id: str) -> List[Project]:
        result = await self.db.execute(
            select(Project)
            .where(Project.owner_id == owner_id)
            .order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_project(self, project_id: str, owner_id: str) -> Project:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    async def update_project(
        self, project_id: str, data: ProjectUpdate, owner_id: str
    ) -> Project:
        project = await self.get_project(project_id, owner_id)
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete_project(self, project_id: str, owner_id: str) -> None:
        project = await self.get_project(project_id, owner_id)
        await self.db.delete(project)
        await self.db.commit()
