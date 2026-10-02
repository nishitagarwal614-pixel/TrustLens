from google import genai
from google.genai import types
from PIL import Image
import io
import os

def extract_text_from_image(image_bytes: bytes, gemini_api_key: str) -> str:
    """
    Uses Gemini Vision API to extract text and claims from an image.
    """
    if not gemini_api_key:
        return "Image analysis unavailable: No API key provided."

    try:
        client = genai.Client(api_key=gemini_api_key)
        img = Image.open(io.BytesIO(image_bytes))

        prompt = "Extract all text from this image. Pay special attention to any financial claims, numbers, dates, stock symbols, and source names. Return the extracted information as plain text."

        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=[img, prompt]
        )
        return response.text
    except Exception as e:
        print(f"[VisionExtractor] Image processing failed: {e}")
        return "Image could not be read or processed."
