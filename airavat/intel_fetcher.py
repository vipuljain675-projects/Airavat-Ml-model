import requests
from bs4 import BeautifulSoup
try:
    from newspaper import Article
    HAS_NEWSPAPER = True
except ImportError:
    HAS_NEWSPAPER = False

def fetch_content(url: str) -> dict:
    """
    Fetches and cleans article content from a URL.
    Returns a dict with 'title', 'text', and 'source'.
    """
    if not HAS_NEWSPAPER:
        # Fallback to simple BS4
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.string if soup.title else "No Title"
            # Very basic extraction
            paragraphs = soup.find_all('p')
            text = "\n".join([p.get_text() for p in paragraphs])
            return {
                "title": title,
                "text": text,
                "source": url
            }
        except Exception as e:
            return {"error": f"Failed to fetch: {str(e)}"}
    
    try:
        article = Article(url)
        article.download()
        article.parse()
        return {
            "title": article.title,
            "text": article.text,
            "source": url,
            "publish_date": str(article.publish_date) if article.publish_date else None
        }
    except Exception as e:
        return {"error": f"Newspaper3k failed: {str(e)}"}

def clean_news_snippet(snippet: str) -> str:
    """Basic cleaning for LLM consumption."""
    return snippet.strip()[:5000] # Limit to avoid context overflow
