import asyncio
import json
import re
from typing import List

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from app.core.config import settings
from app.prompts.test_case_prompts import TEST_CASE_SYSTEM_PROMPT, build_test_case_prompt
from app.services.ai.base_provider import AIProviderError, AIProviderQuotaError, BaseAIProvider


class GeminiProvider(BaseAIProvider):
    """
    Google Gemini implementation of BaseAIProvider.

    Uses the configured Gemini model with response_mime_type="application/json" so the model
    is constrained to return pure JSON — no markdown fences needed.
    """

    def __init__(self) -> None:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self._model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=TEST_CASE_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=0.3,          # deterministic output preferred for structured data
                max_output_tokens=32768,
                response_mime_type="application/json",
            ),
        )

    async def generate_test_cases(self, requirement: str, test_type: str) -> List[dict]:
        prompt = build_test_case_prompt(requirement, test_type)

        # Gemini SDK is synchronous — run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(
                None,
                lambda: self._model.generate_content(
                    prompt,
                    request_options={"timeout": 240},
                ),
            )

            return self._parse(response.text)
        except google_exceptions.NotFound as exc:
            raise AIProviderError(
                f"Gemini model '{settings.GEMINI_MODEL}' was not found or does not support content generation."
            ) from exc
        except google_exceptions.ResourceExhausted as exc:
            raise AIProviderQuotaError(
                f"Gemini quota exceeded for model '{settings.GEMINI_MODEL}'. Try again later or switch GEMINI_MODEL."
            ) from exc
        except google_exceptions.DeadlineExceeded as exc:
            raise AIProviderError(
                "Gemini took too long to generate the master test suite. Try generating one module/use case at a time."
            ) from exc
        except google_exceptions.GoogleAPIError as exc:
            raise AIProviderError(f"Gemini request failed: {exc}") from exc
        except ValueError as exc:
            raise AIProviderError(str(exc)) from exc

    def _parse(self, raw: str) -> List[dict]:
        """Parse the model output into a Python list. Handles edge-case formatting."""
        text = raw.strip()

        # Strip any accidental markdown code fences
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Gemini returned invalid JSON: {exc}\n\nRaw response:\n{raw[:500]}")

        if isinstance(data, list):
            return data

        # Some models wrap the array in an object
        if isinstance(data, dict):
            for key in ("test_cases", "testCases", "cases", "results"):
                if key in data and isinstance(data[key], list):
                    return data[key]

        raise ValueError(f"Unexpected response shape from Gemini: {type(data)}")

    async def health_check(self) -> bool:
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self._model.generate_content("Return an empty JSON array: []"),
            )
            return True
        except Exception:
            return False
