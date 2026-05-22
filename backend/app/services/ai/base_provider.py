from abc import ABC, abstractmethod
from typing import List


class AIProviderError(RuntimeError):
    """Raised when an upstream AI provider cannot complete a request."""


class AIProviderQuotaError(AIProviderError):
    """Raised when an upstream AI provider rejects a request because of quota."""


class BaseAIProvider(ABC):
    """
    Provider abstraction — swap Gemini for OpenAI / Anthropic by implementing this interface.
    Services depend only on BaseAIProvider, never on a concrete class.
    """

    @abstractmethod
    async def generate_test_cases(self, requirement: str, test_type: str) -> List[dict]:
        """Return a list of test-case dicts for the given requirement."""

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the provider is reachable and configured."""
