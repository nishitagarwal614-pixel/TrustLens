from __future__ import annotations

import re
from typing import Optional

import requests
from bs4 import BeautifulSoup


DEFAULT_TIMEOUT = 15

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/154.0.0.0 Safari/537.36"
    )
}


def _clean_text(text: str) -> str:
    if not text:
        return ""

    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_text_from_url(
    url: str,
    timeout: int = DEFAULT_TIMEOUT,
) -> Optional[str]:

    if not url or not url.strip():
        return None

    url = url.strip()

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )

        response.raise_for_status()

        content_type = response.headers.get(
            "content-type", ""
        ).lower()

        if (
            "text/html" not in content_type
            and "application/xhtml" not in content_type
        ):
            return None

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        # Remove elements that usually contain
        # navigation or non-content information.
        for element in soup(
            [
                "script",
                "style",
                "noscript",
                "svg",
                "nav",
                "footer",
                "header",
                "form",
                "iframe",
            ]
        ):
            element.decompose()

        # Prefer the actual article/main content.
        main = (
            soup.find("article")
            or soup.find("main")
            or soup.find("body")
        )

        if main is None:
            return None

        text = main.get_text(
            separator=" ",
            strip=True,
        )

        text = _clean_text(text)

        if not text:
            return None

        # Prevent extremely large webpages from
        # overwhelming the verification pipeline.
        return text[:30000]

    except requests.RequestException as exc:
        print(
            "[URL Extractor] Request failed: "
            f"{type(exc).__name__}: {exc}"
        )
        return None

    except Exception as exc:
        print(
            "[URL Extractor] Extraction failed: "
            f"{type(exc).__name__}: {exc}"
        )
        return None