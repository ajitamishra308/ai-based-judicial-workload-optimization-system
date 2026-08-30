from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, Case
from ml_engine.clustering import cluster_cases, find_similar_cases

router = APIRouter()


@router.post("/run")
def run_clustering(n_clusters: int = 5, db: Session = Depends(get_db)):
    """
    Runs clustering over all cases that have text, and saves each case's
    cluster_id back to the database.
    """
    cases = db.query(Case).filter(Case.full_text.isnot(None), Case.full_text != "").all()
    if len(cases) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 cases with text to cluster")

    texts = [c.full_text for c in cases]
    labels = cluster_cases(texts, n_clusters=n_clusters)

    for case, label in zip(cases, labels):
        case.cluster_id = int(label)
    db.commit()

    return {"clustered_cases": len(cases), "n_clusters": n_clusters}


@router.get("/")
def get_clusters(db: Session = Depends(get_db)):
    """Returns cases grouped by cluster_id -- powers a 'similar cases' view."""
    rows = db.query(Case).filter(Case.cluster_id.isnot(None)).all()
    grouped: dict[int, list] = {}
    for r in rows:
        grouped.setdefault(r.cluster_id, []).append({"case_id": r.case_id, "title": r.title})
    return grouped


@router.get("/similar/{case_id}")
def similar_cases(case_id: str, top_k: int = 5, db: Session = Depends(get_db)):
    target = db.query(Case).filter(Case.case_id == case_id).first()
    if not target or not target.full_text:
        raise HTTPException(status_code=404, detail="Case not found or has no text")

    others = db.query(Case).filter(Case.case_id != case_id, Case.full_text.isnot(None)).all()
    result = find_similar_cases(
        target.full_text,
        [o.full_text for o in others],
        [o.case_id for o in others],
        top_k=top_k,
    )
    return result
