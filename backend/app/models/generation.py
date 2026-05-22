import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Generation(Base):
    __tablename__ = "generations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    requirement = Column(Text, nullable=False)
    # Functional | Integration | Unit | E2E | Performance | Security
    test_type = Column(String, nullable=False)
    # Structured list of test case dicts persisted as JSONB
    test_cases = Column(JSON, nullable=False, default=list)
    test_case_count = Column(Integer, nullable=False, default=0)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project = relationship("Project", back_populates="generations")
    user = relationship("User", back_populates="generations")
