from __future__ import annotations

import io

from PIL import Image
from google import genai


def extract_text_from_image(
    image_bytes: bytes,
    api_key: str,
) -> str:
    """
    Extract readable text and factual visual information
    from an uploaded image using Gemini.

    The returned text is later sent through the same
    live-web verification pipeline as normal text input.
    """

    if not image_bytes:
        return ""

    if not api_key:
        return "Image analysis unavailable: Gemini API key is missing."

    try:
        image = Image.open(io.BytesIO(image_bytes))

        client = genai.Client(api_key=api_key)

        prompt = """
Analyze this image for evidence-verification purposes.

Extract:
1. All readable text visible in the image.
2. Important factual statements shown in the image.
3. Numbers, dates, percentages, names, organizations, locations,
   product names, statistics, or other specific factual information.
4. If the image is a screenshot of a social-media post, preserve
   the actual claim made by the post.
5. Do not invent information that is not visible.

Return plain text only.

If there is no readable text, describe only the factual information
that can clearly be observed and would be useful for later web
verification.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image],
        )

        text = getattr(response, "text", None)

        if not text:
            return "Image analysis unavailable: Gemini returned no readable content."

        return text.strip()

    except Exception as exc:
        print(
            "[Vision Extractor] Image analysis failed: "
            f"{type(exc).__name__}: {exc}"
        )

        return (
            "Image analysis unavailable: "
            f"{type(exc).__name__}: {exc}"
        )