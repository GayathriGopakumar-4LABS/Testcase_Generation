from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class TestCase(BaseModel):
    test_case_id: str
    requirement_id: str
    title: str
    scenario: str
    preconditions: str
    steps: List[str]
    test_data: str
    expected_result: str
    priority: str  # High | Medium | Low
    test_type: str
    actual_result: str = ""
    status: str = ""
    defect_id: str = ""
    defect_status: str = ""
    build_version: str = ""
    remarks: str = ""


class GenerationCreate(BaseModel):
    title: str
    requirement: str
    test_type: str
    project_id: str


class GenerationResponse(BaseModel):
    id: str
    title: str
    requirement: str
    test_type: str
    test_cases: List[dict]
    test_case_count: int
    project_id: str
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GenerationListItem(BaseModel):
    id: str
    title: str
    test_type: str
    test_case_count: int
    project_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
