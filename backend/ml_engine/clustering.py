"""
Clustering module -- groups similar cases together.

Pipeline:
  1. Convert each case's text into a vector using sentence-transformers
     (a pretrained model that understands sentence meaning, not just keywords)
  2. Run KMeans on those vectors to group similar cases into clusters
"""
from functools import lru_cache
import numpy as np


@lru_cache(maxsize=1)
def _get_embedder():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts: list[str]) -> np.ndarray:
    """Turn a list of case texts into a list of vectors (embeddings)."""
    model = _get_embedder()
    return model.encode(texts, show_progress_bar=False)


def cluster_cases(texts: list[str], n_clusters: int = 5) -> list[int]:
    """
    Group cases into n_clusters based on text similarity.
    Returns a cluster_id (0..n_clusters-1) for each input text, in order.
    """
    from sklearn.cluster import KMeans

    if len(texts) < n_clusters:
        n_clusters = max(1, len(texts))

    embeddings = embed_texts(texts)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(embeddings)
    return labels.tolist()


def find_similar_cases(query_text: str, all_texts: list[str], all_ids: list[str], top_k: int = 5):
    """Given one case, find the top_k most similar cases by embedding distance."""
    from sklearn.metrics.pairwise import cosine_similarity

    query_vec = embed_texts([query_text])
    all_vecs = embed_texts(all_texts)
    sims = cosine_similarity(query_vec, all_vecs)[0]

    ranked = sorted(zip(all_ids, sims), key=lambda x: x[1], reverse=True)
    return [{"case_id": cid, "similarity": float(score)} for cid, score in ranked[:top_k]]
