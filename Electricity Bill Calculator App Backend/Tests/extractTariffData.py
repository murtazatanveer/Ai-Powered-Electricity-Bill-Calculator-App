import httpx
import re
from Configuration.gemini_client import extract_from_html
from Configuration.config import settings
import asyncio

URL = settings.tariff_data_extraction_url


PROMPT = """
You are an electricity tariff data extraction system.

You will receive cleaned HTML content from the IESCO Tariff Guide webpage.

Your task is to extract tariff information ONLY from the section:

`A-1 GENERAL SUPPLY TARIFF - RESIDENTIAL`

Do not extract tariff information from any other section.

## Required Data

From the `A-1 GENERAL SUPPLY TARIFF - RESIDENTIAL` section, extract the following two values for EVERY specified tariff range:

- `fixedCharges`
- `applicableCharges`

All extracted numeric values MUST be returned as `float` values, never as integers.

### Lifeline

Extract:

1. Up to 50 Units - Life Line
2. 01 - 100 Units - Life Line

### Protected

Extract:

1. 001 - 100 Units
2. 101 - 200 Units

### Un-Protected

Extract:

1. 1 - 100 Units
2. 101 - 200 Units
3. 201 - 300 Units
4. 301 - 400 Units
5. 401 - 500 Units
6. 501 - 600 Units
7. 601 - 700 Units
8. Above 700 Units

## Required Successful Response

If the HTML contains ALL of the required tariff data and the values can be reliably extracted, return ONLY the following JSON structure:

{
  "message": "Tariff Rates Fetched",
  "success": true,
  "lifeline": [
    {
      "type": "upto50",
      "fixedCharges": 0.0,
      "applicableCharges": 5.0
    },
    {
      "type": "above50",
      "fixedCharges": 0.0,
      "applicableCharges": 10.0
    }
  ],
  "protected": [
    {
      "type": "below100",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "above100",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    }
  ],
  "unprotected": [
    {
      "type": "below100",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below200",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below300",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below400",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below500",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below600",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "below700",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    },
    {
      "type": "above700",
      "fixedCharges": 50.0,
      "applicableCharges": 300.0
    }
  ]
}

The numeric values shown above are examples of the required data types and JSON structure. Do NOT return these example values unless they are actually present in the provided HTML. Extract the actual values from the HTML.

## Type Mapping

Use exactly these `type` values:

### Lifeline

- `upto50` → Up to 50 Units - Life Line
- `above50` → 01 - 100 Units - Life Line

### Protected

- `below100` → 001 - 100 Units
- `above100` → 101 - 200 Units

### Un-Protected

- `below100` → 1 - 100 Units
- `below200` → 101 - 200 Units
- `below300` → 201 - 300 Units
- `below400` → 301 - 400 Units
- `below500` → 401 - 500 Units
- `below600` → 501 - 600 Units
- `below700` → 601 - 700 Units
- `above700` → Above 700 Units

## Extraction Rules

- Extract values ONLY from the provided HTML.
- Do not use outside knowledge.
- Do not guess, estimate, calculate, or invent tariff values.
- Do not substitute values from another tariff category or section.
- Carefully match each tariff rate with its correct unit range.
- Extract both `fixedCharges` and `applicableCharges` for every required range.
- Convert every numeric tariff value to a float.
- For example, `75` must be returned as `75.0`.
- Do not return integers for `fixedCharges` or `applicableCharges`.
- Preserve the actual tariff values found in the HTML.
- Do not change, combine, or recalculate tariff rates.
- The successful response must contain all required categories and all required tariff ranges.
- If even ONE required tariff range or required value cannot be reliably found, do not return partial data. Return the invalid JSON response.

## Invalid Response

If the provided HTML does not contain the required tariff information, or if any required tariff range or either of its required values (`fixedCharges` or `applicableCharges`) cannot be reliably extracted, return ONLY:

{
  "message": "Tariff rates not found",
  "success": false
}

## Response Restriction

There are ONLY TWO possible responses:

1. The successful tariff JSON containing all required tariff data.
2. The invalid JSON:

{
  "message": "Tariff rates not found",
  "success": false
}

In ANY situation, return exactly one of these two JSON objects.

Return ONLY valid JSON.

Do NOT return:
- Explanations
- Descriptions
- Markdown
- Code fences
- Comments
- Additional fields
- Additional text
- Analysis
- Warnings
- Confidence scores
- Any characters before the opening `{`
- Any characters after the closing `}`

The response MUST start with `{` and MUST end with `}`.

The JSON must be directly parseable by the backend.
"""


async def fetch_html(url: str, timeout: float = 30.0) -> str:

    HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}
    async with httpx.AsyncClient(
        timeout=timeout,
        follow_redirects=True,
        headers=HEADERS,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text
    

_RE_SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>", re.DOTALL | re.IGNORECASE)
_RE_STYLE = re.compile(r"<style\b[^>]*>.*?</style>", re.DOTALL | re.IGNORECASE)
_RE_NOSCRIPT = re.compile(r"<noscript\b[^>]*>.*?</noscript>", re.DOTALL | re.IGNORECASE)
_RE_IFRAME = re.compile(r"<iframe\b[^>]*>.*?</iframe>", re.DOTALL | re.IGNORECASE)
_RE_SVG = re.compile(r"<svg\b[^>]*>.*?</svg>", re.DOTALL | re.IGNORECASE)
_RE_COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)
_RE_LINK_META = re.compile(r"<(link|meta)\b[^>]*/?>", re.IGNORECASE)
_RE_EVENT_HANDLERS = re.compile(r'\son\w+\s*=\s*"[^"]*"', re.IGNORECASE)
_RE_EVENT_HANDLERS_SQ = re.compile(r"\son\w+\s*=\s*'[^']*'", re.IGNORECASE)
_RE_WHITESPACE = re.compile(r"\s+")


def clean_html(html: str) -> str:
   
    if not html:
        return ""

    # 1) Remove block-level junk (with content)
    html = _RE_SCRIPT.sub("", html)
    html = _RE_STYLE.sub("", html)
    html = _RE_NOSCRIPT.sub("", html)
    html = _RE_IFRAME.sub("", html)
    html = _RE_SVG.sub("", html)

    # 2) Remove comments
    html = _RE_COMMENT.sub("", html)

    # 3) Remove <link> and <meta> tags
    html = _RE_LINK_META.sub("", html)

    # 4) Remove inline event handlers (onclick=..., onload=...)
    html = _RE_EVENT_HANDLERS.sub("", html)
    html = _RE_EVENT_HANDLERS_SQ.sub("", html)

    # 5) Collapse runs of whitespace (newlines, tabs, spaces) into one space
    html = _RE_WHITESPACE.sub(" ", html)

    # 6) Trim
    return html.strip()

async def main():

    try:

        print("─" * 60)
        print(f"Fetching: {URL}")
        print("─" * 60)

        raw_html = await fetch_html(URL,40.0)
        print(f"Raw HTML length:     {len(raw_html):>8} chars")

        cleaned = clean_html(raw_html)
        print(f"Cleaned HTML length: {len(cleaned):>8} chars")
        reduction = 100 * (1 - len(cleaned) / len(raw_html))
        print(f"Reduction:           {reduction:>7.1f}%")

        print()
        print("─" * 60)
        print("______Sending cleaned html to gemini______")
        rawRes = await extract_from_html(PROMPT,cleaned)
        print(f"Response length: {len(rawRes)} chars")
        print("Responce is")
        print()
        print()
        print(rawRes)
    except Exception as e:
        print("Error --> ",str(e))


if __name__ == "__main__":
    asyncio.run(main())