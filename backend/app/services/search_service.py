from typing import List, Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from ddgs import DDGS


OFFICIAL_DOMAINS = {
    "sebi.gov.in",
    "rbi.org.in",
    "nseindia.com",
    "bseindia.com",
    "gov.in",
    "nic.in",
}


USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/120.0 Safari/537.36"
)


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
            parsed.scheme in {
                "http",
                "https"
            }
            and bool(parsed.netloc)
        )

    except Exception:
        return False


def fetch_page(url: str) -> str:
    """
    Download and extract readable text from a webpage.

    Failed pages are skipped rather than stopping the
    complete verification process.
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
                    "application/xhtml+xml"
                ),
            },
            timeout=(5, 10),
            allow_redirects=True,
        )

        if response.status_code in {
            401,
            403,
            404,
            429,
        }:
            print(
                f"[SearchService] Skipping "
                f"{url} ({response.status_code})"
            )
            return ""

        response.raise_for_status()

        content_type = (
            response.headers
            .get("content-type", "")
            .lower()
        )

        # Only parse HTML pages.
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

        for element in soup([
            "script",
            "style",
            "noscript",
            "nav",
            "footer",
            "header",
            "form",
            "svg",
        ]):
            element.decompose()

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        return " ".join(
            text.split()
        )[:30000]

    except requests.exceptions.SSLError as exc:

        print(
            f"[SearchService] SSL skipped "
            f"{url}: {exc}"
        )

        return ""

    except requests.exceptions.Timeout:

        print(
            f"[SearchService] Timeout skipped "
            f"{url}"
        )

        return ""

    except requests.exceptions.RequestException as exc:

        print(
            f"[SearchService] Could not retrieve "
            f"{url}: {exc}"
        )

        return ""

    except Exception as exc:

        print(
            f"[SearchService] Page parsing failed "
            f"for {url}: {exc}"
        )

        return ""


def _clean_query(query: str) -> str:
    """
    Prevent internal metadata or source labels from
    becoming search queries.
    """

    if not query:
        return ""

    cleaned = query.strip()

    # Remove accidental internal metadata.
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


def _search(
    query: str,
    max_results: int
) -> List[Dict]:

    results = []

    query = _clean_query(query)

    if not query:
        return results

    try:

        print(
            f"[SearchService] Searching: {query}"
        )

        with DDGS() as ddgs:

            search_results = ddgs.text(
                query,
                max_results=max_results
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

                domain = get_domain(url)

                page_text = fetch_page(
                    url
                )

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

                        "source_name": domain,

                        "source_type": (
                            "Official Source"
                            if is_official_source(url)
                            else "Web Source"
                        ),

                        "page_text": page_text,

                        "is_authoritative": (
                            is_official_source(url)
                        ),
                    }
                )

    except Exception as exc:

        print(
            "[SearchService] Search failed "
            f"for '{query}': {exc}"
        )

    return results


def _search_preferred_domain(
    query: str,
    preferred_domain: str,
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

    # Do not search internal labels.
    query = _clean_query(query)

    if not query:
        return []

    site_query = (
        f"site:{preferred_domain} {query}"
    )

    print(
        f"[SearchService] Preferred-domain search: "
        f"{site_query}"
    )

    return _search(
        site_query,
        max_results
    )


def perform_web_search(
    query: str,
    max_results: int = 8,
    preferred_domain: Optional[str] = None
) -> List[Dict]:

    """
    Perform real web search.

    Strategy:
    1. Search the preferred official domain.
    2. Search the actual claim normally.
    3. Deduplicate URLs.
    4. Put authoritative sources first.
    5. Do not fail the complete analysis because
       an individual webpage returns 403/SSL/timeout.
    """

    query = _clean_query(query)

    if not query:
        return []

    collected = []
    seen_urls = set()

    # -------------------------------------------------
    # 1. PREFERRED OFFICIAL DOMAIN
    # -------------------------------------------------

    if preferred_domain:

        preferred_results = (
            _search_preferred_domain(
                query=query,
                preferred_domain=preferred_domain,
                max_results=max_results
            )
        )

        for result in preferred_results:

            url = result.get(
                "source_url",
                ""
            )

            if not url:
                continue

            if url in seen_urls:
                continue

            seen_urls.add(url)

            collected.append(
                result
            )

    # -------------------------------------------------
    # 2. GENERAL SEARCH
    # -------------------------------------------------

    general_results = _search(
        query=query,
        max_results=max_results
    )

    for result in general_results:

        url = result.get(
            "source_url",
            ""
        )

        if not url:
            continue

        if url in seen_urls:
            continue

        seen_urls.add(url)

        collected.append(
            result
        )

    # -------------------------------------------------
    # 3. RANK SOURCES
    # -------------------------------------------------

    def source_score(
        item: Dict
    ) -> tuple:

        official = bool(
            item.get(
                "is_authoritative",
                False
            )
        )

        has_page = bool(
            item.get(
                "page_text",
                ""
            ).strip()
        )

        has_excerpt = bool(
            item.get(
                "excerpt",
                ""
            ).strip()
        )

        return (
            official,
            has_page,
            has_excerpt
        )

    collected.sort(
        key=source_score,
        reverse=True
    )

    return collected[:max_results]