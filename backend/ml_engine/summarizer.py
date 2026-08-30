from functools import lru_cache


@lru_cache(maxsize=1)
def _get_fallback_summarizer():
    return None


def summarize_text(text: str, max_sentences: int = 3) -> str:
    cleaned = " ".join((text or "").split())
    if not cleaned:
        return ""

    sentences = [part.strip() for part in cleaned.split(".") if part.strip()]
    if not sentences:
        return cleaned[:500]

    if len(sentences) <= max_sentences:
        return ". ".join(sentences) + "."

    return ". ".join(sentences[:max_sentences]) + "."
