from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db, Case
from ml_engine.priority import rank_cases

router = APIRouter()


@router.get("/")
def get_cause_list(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns pending cases ranked by priority score -- this is the
    'smart cause list' the dashboard's Priority Matrix + Recent Cases table use.
    """
    pending = db.query(Case).filter(Case.disposal_nature == "Pending").all()

    case_dicts = [
        {
            "case_id": c.case_id,
            "title": c.title,
            "case_type": c.case_type,
            "stage": c.stage,
            "filing_date": c.decision_date,  # substitute field until a dedicated filing_date exists
        }
        for c in pending
    ]
    ranked = rank_cases(case_dicts)
    return ranked[:limit]


@router.get("/matrix")
def priority_matrix(db: Session = Depends(get_db)):
    """
    Buckets pending cases into the 4 quadrants shown in the Priority Matrix
    widget: Critical (act now), Important (not urgent), Urgent (schedule soon), Routine.
    """
    pending = db.query(Case).filter(Case.disposal_nature == "Pending").all()
    case_dicts = [
        {"case_id": c.case_id, "case_type": c.case_type, "stage": c.stage, "filing_date": c.decision_date}
        for c in pending
    ]
    ranked = rank_cases(case_dicts)

    buckets = {"critical": 0, "important": 0, "urgent": 0, "routine": 0}
    for c in ranked:
        score = c["priority_score"]
        if score >= 0.7:
            buckets["critical"] += 1
        elif score >= 0.5:
            buckets["urgent"] += 1
        elif score >= 0.3:
            buckets["important"] += 1
        else:
            buckets["routine"] += 1
    return buckets
