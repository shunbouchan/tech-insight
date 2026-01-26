import re

EXCERPT_LENGTH = 200
SNIPPET_MAX_LENGTH = 200


def create_excerpt(content: str) -> str:
    """Create excerpt from content (first 200 chars)."""
    if len(content) <= EXCERPT_LENGTH:
        return content
    return content[:EXCERPT_LENGTH] + "..."


def extract_snippet(content: str, query: str) -> str | None:
    """Extract the most relevant snippet from content based on query terms.

    Splits content into sentences and selects the best-matching ones.
    """
    if not content or not query:
        return None

    # Split into sentences
    sentences = re.split(r'(?<=[.!?。！？])\s*', content)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return None

    query_terms = [t.lower() for t in query.split() if len(t) >= 2]
    if not query_terms:
        return None

    # Score each sentence by how many query terms it contains
    scored = []
    for i, sentence in enumerate(sentences):
        lower = sentence.lower()
        score = sum(1 for term in query_terms if term in lower)
        if score > 0:
            scored.append((score, i, sentence))

    if not scored:
        return None

    # Sort by score desc, then by position asc (prefer earlier sentences)
    scored.sort(key=lambda x: (-x[0], x[1]))

    # Take the top 1-2 sentences, then restore original document order
    selected = sorted(scored[:2], key=lambda x: x[1])

    parts: list[str] = []
    total_len = 0
    for _, _, sentence in selected:
        if total_len + len(sentence) > SNIPPET_MAX_LENGTH:
            break
        parts.append(sentence)
        total_len += len(sentence)

    return " ".join(parts) if parts else None
