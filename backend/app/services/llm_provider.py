import json
import time
import requests
from typing import Dict, Any

from app.config import settings
from google import genai
from google.genai import types


class LLMProvider:

    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.provider = settings.LLM_PROVIDER.lower()

    def is_available(self) -> bool:
        return bool(
            self.api_key
            and len(self.api_key.strip()) > 5
        )

    def _build_prompt(
        self,
        content,
        claims,
        evidence,
    ):

        evidence_text = []

        for item in evidence or []:

            source = item.get(
                "source_name",
                "Unknown source",
            )

            url = item.get(
                "source_url",
                "",
            )

            snippet = (
                item.get("snippet")
                or item.get("excerpt")
                or item.get("page_text")
                or ""
            )

            evidence_text.append(
                f"""
SOURCE: {source}
URL: {url}
EVIDENCE:
{snippet[:5000]}
"""
            )

        claims_text = "\n".join(
            f"- {claim.get('claim', '')}"
            for claim in claims or []
        )

        return f"""
You are a careful factual verification system.

Analyze the submitted claim using ONLY the supplied evidence.

Do NOT provide investment advice.
Do NOT make financial recommendations.
Do NOT invent evidence.

Possible claim statuses:

Supported
Partially Supported
Contradicted
Unverified

Return ONLY valid JSON.

The JSON must have this structure:

{{
  "claims": [
    {{
      "claim": "string",
      "status": "Supported",
      "confidence": 0.0,
      "explanation": "string"
    }}
  ],
  "overall_status": "Information supported",
  "risk_level": "Low",
  "summary": "string"
}}

USER CONTENT:
{content}

CLAIMS:
{claims_text}

RETRIEVED EVIDENCE:
{"".join(evidence_text)}
"""

    def _call_gemini(
        self,
        client,
        model,
        prompt,
    ):

        print(
            f"[LLMProvider] Trying Gemini model: {model}"
        )

        start_time = time.time()

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=1500,
                temperature=0,
            ),
        )

        elapsed = time.time() - start_time

        print(
            f"[LLMProvider] {model} response "
            f"received in {elapsed:.2f}s"
        )

        if not response.text:
            raise ValueError(
                "Gemini returned an empty response."
            )

        return json.loads(
            response.text
        )

    def analyze_with_llm(
        self,
        content,
        claims,
        retrieved_evidence,
    ):

        if not self.is_available():

            print(
                "[LLMProvider] API key is not available."
            )

            return None

        prompt = self._build_prompt(
            content,
            claims,
            retrieved_evidence,
        )

        # ====================================================
        # GEMINI
        # ====================================================

        if self.provider == "gemini":

            try:

                client = genai.Client(
                    api_key=self.api_key,
                    http_options=types.HttpOptions(
                        timeout=30000
                    ),
                )

            except Exception as exc:

                print(
                    "[LLMProvider] Could not create "
                    f"Gemini client: {exc}"
                )

                return None

            models_to_try = [
                "gemini-3.8-flash",
                "gemini-3.7-flash",
                "gemini-3.6-flash",
            ]

            for model in models_to_try:

                try:

                    result = self._call_gemini(
                        client,
                        model,
                        prompt,
                    )

                    print(
                        "[LLMProvider] Gemini verification "
                        f"succeeded using {model}."
                    )

                    try:
                        client.close()
                    except Exception:
                        pass

                    return result

                except Exception as exc:

                    error_text = str(
                        exc
                    ).lower()

                    print(
                        f"[LLMProvider] {model} failed: "
                        f"{exc}"
                    )

                    temporary_error = (
                        "503" in error_text
                        or "unavailable" in error_text
                        or "high demand" in error_text
                        or "temporarily" in error_text
                        or "timeout" in error_text
                        or "timed out" in error_text
                        or "deadline" in error_text
                        or "connection" in error_text
                    )

                    if temporary_error:

                        print(
                            "[LLMProvider] Gemini model "
                            "unavailable or timed out."
                        )

                        print(
                            "[LLMProvider] Trying next model..."
                        )

                        time.sleep(1)

                        continue

                    print(
                        "[LLMProvider] "
                        "Non-retryable Gemini error."
                    )

                    break

            try:
                client.close()
            except Exception:
                pass

            print(
                "[LLMProvider] All Gemini models were "
                "unavailable or timed out."
            )

            return None

        # ====================================================
        # OPENAI
        # ====================================================

        if self.provider == "openai":

            try:

                headers = {
                    "Authorization": (
                        f"Bearer {self.api_key}"
                    ),
                    "Content-Type": "application/json",
                }

                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    "response_format": {
                        "type": "json_object"
                    },
                    "temperature": 0,
                }

                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30,
                )

                response.raise_for_status()

                data = response.json()

                return json.loads(
                    data["choices"][0]["message"]["content"]
                )

            except Exception as exc:

                print(
                    "[LLMProvider] OpenAI failed:",
                    exc,
                )

                return None

        print(
            f"[LLMProvider] Unsupported provider: "
            f"{self.provider}"
        )

        return None


llm_provider = LLMProvider()