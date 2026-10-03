from typing import List, Dict, Optional
from urllib.parse import urlparse

import truststore
truststore.inject_into_ssl()

import requests
from bs4 import BeautifulSoup

try:
    from ddgs import DDGS
except ImportError:
    DDGS = None


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/140.0 Safari/537.36"
)

OFFICIAL_DOMAINS = {
    "gov.in",
    "nic.in",
    "rbi.org.in",
    "sebi.gov.in",
    "nseindia.com",
    "bseindia.com",
}


def get_domain(url: str) -> str:
    try:
        return (
            urlparse(url)
            .netloc
            .lower()
            .replace("www.", "")
        )
    except Exception:
        return ""


def is_official_source(url: str) -> bool:
    domain = get_domain(url)

    return any(
        domain == official
        or domain.endswith("." + official)
        for official in OFFICIAL_DOMAINS
    )


def _is_valid_url(url: str) -> bool:
    if not url:
        return False

    try:
        parsed = urlparse(url)

        return (
            parsed.scheme in {"http", "https"}
            and bool(parsed.netloc)
        )

    except Exception:
        return False


def fetch_page(url: str) -> str:
    """
    Fetches the ACTUAL webpage supplied by the user
    or discovered through live web search.

    No local/demo document is used here.
    """

    if not _is_valid_url(url):
        return ""

    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": (
                    "text/html,"
                    "application/xhtml+xml,"
                    "application/xml;q=0.9,"
                    "*/*;q=0.8"
                ),
            },
            timeout=(5, 15),
            allow_redirects=True,
        )

        if response.status_code in {
            401,
            403,
            404,
            429,
        }:
            print(
                f"[SearchService] "
                f"Skipping {url} "
                f"HTTP {response.status_code}"
            )
            return ""

        response.raise_for_status()

        content_type = (
            response.headers
            .get("content-type", "")
            .lower()
        )

        if (
            "text/html" not in content_type
            and "application/xhtml+xml"
            not in content_type
        ):
            return ""

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        for element in soup(
            [
                "script",
                "style",
                "noscript",
                "nav",
                "footer",
                "header",
                "form",
                "svg",
                "iframe",
            ]
        ):
            element.decompose()

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        return " ".join(text.split())[:30000]

    except requests.exceptions.Timeout:
        print(
            f"[SearchService] Timeout: {url}"
        )
        return ""

    except requests.exceptions.RequestException as exc:
        print(
            f"[SearchService] "
            f"Request failed: {url} "
            f"-> {exc}"
        )
        return ""

    except Exception as exc:
        print(
            f"[SearchService] "
            f"Page parsing failed: {exc}"
        )
        return ""


def _clean_query(query: str) -> str:
    if not query:
        return ""

    cleaned = query.strip()

    prefixes = [
        "[Source URL Content]",
        "[Image Content]",
    ]

    for prefix in prefixes:
        if cleaned.startswith(prefix):
            cleaned = (
                cleaned[len(prefix):]
                .strip()
            )

    return cleaned


def _google_search(
    query: str,
    max_results: int
) -> List[Dict]:
    """
    REAL INTERNET SEARCH.

    Uses the Google backend through DDGS.
    Nothing is read from the project's
    local demo documents.
    """

    if DDGS is None:
        raise RuntimeError(
            "ddgs is not installed. "
            "Run: pip install -r requirements.txt"
        )

    results = []

    try:
        print(
            f"[SearchService] "
            f"Google web search: {query}"
        )

        with DDGS() as ddgs:

            search_results = ddgs.text(
                query,
                backend="google",
                max_results=max_results,
            )

            for result in search_results:

                if not isinstance(
                    result,
                    dict
                ):
                    continue

                url = result.get(
                    "href",
                    ""
                )

                if not _is_valid_url(url):
                    continue

                page_text = fetch_page(url)

                results.append(
                    {
                        "title": result.get(
                            "title",
                            ""
                        ),
                        "source_url": url,
                        "excerpt": result.get(
                            "body",
                            ""
                        ),
                        "source_name": get_domain(
                            url
                        ),
                        "source_type": (
                            "Official Source"
                            if is_official_source(
                                url
                            )
                            else "Web Source"
                        ),
                        "page_text": page_text,
                        "is_authoritative": (
                            is_official_source(
                                url
                            )
                        ),
                    }
                )

    except Exception as exc:
        print(
            "[SearchService] "
            f"Google search failed: {exc}"
        )

    return results


def _fallback_search(
    query: str,
    max_results: int
) -> List[Dict]:
    """
    Fallback internet search if Google
    is temporarily unavailable.

    Still uses the REAL INTERNET.
    """

    if DDGS is None:
        return []

    results = []

    try:
        print(
            f"[SearchService] "
            f"Fallback web search: {query}"
        )

        with DDGS() as ddgs:

            search_results = ddgs.text(
                query,
                max_results=max_results,
            )

            for result in search_results:

                if not isinstance(
                    result,
                    dict
                ):
                    continue

                url = result.get(
                    "href",
                    ""
                )

                if not _is_valid_url(url):
                    continue

                page_text = fetch_page(url)

                results.append(
                    {
                        "title": result.get(
                            "title",
                            ""
                        ),
                        "source_url": url,
                        "excerpt": result.get(
                            "body",
                            ""
                        ),
                        "source_name": get_domain(
                            url
                        ),
                        "source_type": (
                            "Official Source"
                            if is_official_source(
                                url
                            )
                            else "Web Source"
                        ),
                        "page_text": page_text,
                        "is_authoritative": (
                            is_official_source(
                                url
                            )
                        ),
                    }
                )

    except Exception as exc:
        print(
            "[SearchService] "
            f"Fallback search failed: {exc}"
        )

    return results


def _search_preferred_domain(
    query: str,
    preferred_domain: Optional[str],
    max_results: int
) -> List[Dict]:

    if not preferred_domain:
        return []

    preferred_domain = (
        preferred_domain
        .lower()
        .replace("www.", "")
        .strip()
    )

    query = _clean_query(query)

    if not query:
        return []

    site_query = (
        f"site:{preferred_domain} {query}"
    )

    print(
        "[SearchService] "
        f"Preferred-domain search: "
        f"{site_query}"
    )

    return _google_search(
        site_query,
        max_results
    )


def perform_web_search(
    query: str,
    max_results: int = 8,
    preferred_domain: Optional[str] = None,
) -> List[Dict]:
    """
    Main LIVE WEB SEARCH function.

    Search order:

    1. Preferred official domain
    2. Google web search
    3. Internet fallback search

    NEVER searches local files or the
    project's demo vector store.
    """

    query = _clean_query(query)

    if not query:
        return []

    collected = []
    seen_urls = set()

    # ------------------------------------------------
    # 1. Preferred domain
    # ------------------------------------------------

    if preferred_domain:

        preferred_results = (
            _search_preferred_domain(
                query,
                preferred_domain,
                max_results,
            )
        )

        for result in preferred_results:

            url = result.get(
                "source_url",
                ""
            )

            if (
                not url
                or url in seen_urls
            ):
                continue

            seen_urls.add(url)
            collected.append(result)

    # ------------------------------------------------
    # 2. Google
    # ------------------------------------------------

    google_results = _google_search(
        query,
        max_results
    )

    for result in google_results:

        url = result.get(
            "source_url",
            ""
        )

        if (
            not url
            or url in seen_urls
        ):
            continue

        seen_urls.add(url)
        collected.append(result)

    # ------------------------------------------------
    # 3. Fallback
    # ------------------------------------------------

    if not collected:

        fallback_results = (
            _fallback_search(
                query,
                max_results
            )
        )

        for result in fallback_results:

            url = result.get(
                "source_url",
                ""
            )

            if (
                not url
                or url in seen_urls
            ):
                continue

            seen_urls.add(url)
            collected.append(result)

    # ------------------------------------------------
    # Source quality ordering
    # ------------------------------------------------

    def source_score(
        item: Dict
    ):
        return (
            bool(
                item.get(
                    "is_authoritative",
                    False
                )
            ),
            bool(
                item.get(
                    "page_text",
                    ""
                ).strip()
            ),
            bool(
                item.get(
                    "excerpt",
                    ""
                ).strip()
            ),
        )

    collected.sort(
        key=source_score,
        reverse=True
    )

    return collected[:max_results]