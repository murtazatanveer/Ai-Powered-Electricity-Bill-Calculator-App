import re

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


def cleanHTML(html: str) -> str:
   
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