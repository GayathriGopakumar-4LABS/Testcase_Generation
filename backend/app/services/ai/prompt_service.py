from typing import List

from app.services.ai.base_provider import BaseAIProvider
from app.services.ai.gemini_provider import GeminiProvider


class PromptService:
    """
    Thin orchestration layer between route handlers and the AI provider.
    Injects GeminiProvider by default; pass a different provider for testing or provider swaps.
    """

    def __init__(self, provider: BaseAIProvider | None = None) -> None:
        self._provider: BaseAIProvider = provider or GeminiProvider()

    async def generate_test_cases(self, requirement: str, test_type: str) -> List[dict]:
        return await self._provider.generate_test_cases(requirement, test_type)
