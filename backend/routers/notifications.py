"""
Notifications router -- generates alerts from current data rather than
requiring a separate manual-entry system:
  - Critical-priority pending cases -> "needs scheduling" alert
  - Judges over their daily capacity -> "overloaded" alert
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, Case, Judge
from ml_engine.priority import rank_cases

router = APIRouter()


@router.get("/")
def get_notifications(db: Session = Depends(get_db)):
    alerts = []

    pending = db.query(Case).filter(Case.disposal_nature == "Pending").all()
    case_dicts = [
        {"case_id": c.case_id, "title": c.title, "case_type": c.case_type,
         "stage": c.stage, "filing_date": c.decision_date}
        for c in pending
    ]
    ranked = rank_cases(case_dicts)
    critical = [c for c in ranked if c["priority_score"] >= 0.75]

    for c in critical[:10]:
        alerts.append({
            "level": "critical",
            "message": f"Case {c['case_id']} ({c['title']}) is high priority and needs scheduling.",
        })

    judges = db.query(Judge).filter(Judge.active == 1).all()
    for j in judges:
        count = db.query(func.count(Case.id)).filter(
            Case.assigned_judge == j.name, Case.disposal_nature == "Pending"
        ).scalar() or 0
        capacity = j.max_daily_capacity * 20  # rough monthly capacity
        if count > capacity:
            alerts.append({
                "level": "warning",
                "message": f"{j.name} is overloaded: {count} pending cases (capacity ~{capacity}).",
            })

    if not alerts:
        alerts.append({"level": "info", "message": "No urgent alerts right now."})

    return alerts
