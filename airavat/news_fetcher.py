"""
news_fetcher.py
---------------
Pulls real-time geopolitical headlines relevant to India from free RSS feeds.
No API key required. Uses only Python stdlib (urllib + xml.etree).
"""
from __future__ import annotations

import re
import ssl
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.error import URLError
from urllib.request import Request, urlopen

import certifi


# ---------------------------------------------------------------------------
# Feed sources — all free, no auth needed
# ---------------------------------------------------------------------------
RSS_FEEDS: list[dict] = [
    {
        "name": "Google News – India",
        "url": "https://news.google.com/rss/search?q=India+geopolitics+foreign+policy&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
        "name": "Google News – India China",
        "url": "https://news.google.com/rss/search?q=India+China+border+military&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
        "name": "Google News – India Pakistan",
        "url": "https://news.google.com/rss/search?q=India+Pakistan+security&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
        "name": "Google News – India USA trade",
        "url": "https://news.google.com/rss/search?q=India+USA+trade+tariff+diplomacy&hl=en-IN&gl=IN&ceid=IN:en",
    },
]

# Keywords that flag a headline as geopolitically relevant
RELEVANCE_KEYWORDS = [
    "india", "pakistan", "china", "nepal", "bangladesh", "sri lanka", "myanmar",
    "maldives", "bhutan", "tibet", "arunachal", "kashmir", "ladakh",
    "military", "sanctions", "tariff", "trade deal", "regime", "coup",
    "naval", "border", "nuclear", "missile", "drone", "army", "air force",
    "cia", "raw", "intelligence", "geopolit", "diplomat", "war", "conflict",
    "modi", "trump", "xi jinping", "putin", "supply chain", "oil", "energy",
    "quad", "brics", "nato", "russia", "usa", "iran", "israel", "venezuela",
]

STRIP_TAGS = re.compile(r"<[^>]+>")


def _is_relevant(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in RELEVANCE_KEYWORDS)


def _strip_html(text: str) -> str:
    return STRIP_TAGS.sub("", text).strip()


def _fetch_feed(feed: dict, ssl_ctx: ssl.SSLContext, timeout: int = 8) -> list[dict]:
    """Fetch one RSS feed and return a list of {title, link, published} dicts."""
    try:
        req = Request(
            feed["url"],
            headers={"User-Agent": "AiravatBot/1.0 (geopolitical-research-tool)"},
        )
        with urlopen(req, timeout=timeout, context=ssl_ctx) as resp:
            raw = resp.read()
    except (URLError, OSError):
        return []

    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return []

    items = []
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    # Support both RSS 2.0 and Atom (Google News returns RSS 2.0)
    for item in root.iter("item"):
        title_el = item.find("title")
        link_el = item.find("link")
        pub_el = item.find("pubDate")

        title = _strip_html(title_el.text or "") if title_el is not None else ""
        link = (link_el.text or "").strip() if link_el is not None else ""
        pub = (pub_el.text or "").strip() if pub_el is not None else ""

        if title and _is_relevant(title):
            items.append({"source": feed["name"], "title": title, "link": link, "published": pub})

    return items


def fetch_live_headlines(max_items: int = 8, query: str | None = None) -> list[dict]:
    """
    Fetch and de-duplicate geopolitically relevant headlines.
    If a query is provided, it searches specifically for that topic.
    """
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    seen_titles: set[str] = set()
    results: list[dict] = []

    feeds_to_crawl = list(RSS_FEEDS)

    # If query is provided, add a dynamic search feed at the top priority
    if query:
        # Clean the query for URL encoding (simple version)
        import urllib.parse
        encoded_q = urllib.parse.quote(query)
        dynamic_feed = {
            "name": f"Dynamic Search: {query[:30]}...",
            "url": f"https://news.google.com/rss/search?q={encoded_q}&hl=en-IN&gl=IN&ceid=IN:en",
        }
        feeds_to_crawl.insert(0, dynamic_feed)

    for feed in feeds_to_crawl:
        for item in _fetch_feed(feed, ssl_ctx):
            key = item["title"].lower()[:60]
            if key not in seen_titles:
                seen_titles.add(key)
                results.append(item)
            if len(results) >= max_items:
                break
        if len(results) >= max_items:
            break

    return results


def format_news_context(headlines: list[dict]) -> str:
    """Format headlines as a concise context block for the LLM prompt."""
    if not headlines:
        return "[Live news feed unavailable — proceeding with static database only]"

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"=== LIVE INTELLIGENCE FEED (fetched {now}) ==="]
    for i, h in enumerate(headlines, 1):
        lines.append(f"{i}. [{h['source']}] {h['title']}")
        if h.get("published"):
            lines.append(f"   Published: {h['published']}")
    lines.append("=" * 50)
    return "\n".join(lines)
