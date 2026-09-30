import json
import re
from typing import Any

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)

def _extract_balanced_json(text: str) -> str | None:
    """
    Scan for the first '{' and return the substring up to its matching '}'.
    Correctly skips braces inside string literals and handles escapes.
    """
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escaped = False

    for i in range(start, len(text)):
        ch = text[i]

        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue

        # not in string
        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]

    return None


def extractJSON(text: str) -> Any:
    """
    Parse the first JSON object from the given text.

    Args:
        text: raw text returned by the LLM.

    Returns:
        Parsed Python object (usually a dict).

    Raises:
        ValueError: if no valid JSON object can be extracted.
    """
    if not text or not text.strip():
        raise ValueError("Empty input")

    text = text.strip()

    # 1) Fast path — is the whole thing already valid JSON?
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2) Try fenced block: ```json ... ```
    fence_match = _FENCE_RE.search(text)
    if fence_match:
        inner = fence_match.group(1).strip()
        try:
            return json.loads(inner)
        except json.JSONDecodeError:
            pass

    # 3) Balanced-brace scan on the whole text
    candidate = _extract_balanced_json(text)
    if candidate:
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    # 4) Balanced-brace scan on the fenced content (if any)
    if fence_match:
        candidate = _extract_balanced_json(fence_match.group(1))
        if candidate:
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

    raise ValueError(f"Could not extract valid JSON from text: {text}")
