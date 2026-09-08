"""
Judges router -- manage judge records and see per-judge workload.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from database import get_db, Judge, Case

router = APIRouter()


class JudgeIn(BaseModel):
    name: str
    court: str = "District Court"
    specialization: str = "General"
    max_daily_capacity: int = 8


@router.get("/")
def list_judges(db: Session = Depends(get_db)):
    judges = db.query(Judge).all()
    result = []
    for j in judges:
        case_count = db.query(func.count(Case.id)).filter(
            Case.assigned_judge == j.name, Case.disposal_nature == "Pending"
        ).scalar() or 0
        load_pct = min(100, round((case_count / max(1, j.max_daily_capacity * 20)) * 100))
        result.append({
            "id": j.id, "name": j.name, "court": j.court,
            "specialization": j.specialization, "max_daily_capacity": j.max_daily_capacity,
            "active": bool(j.active), "assigned_cases": case_count, "load_pct": load_pct,
        })
    return result


@router.post("/")
def add_judge(judge: JudgeIn, db: Session = Depends(get_db)):
    existing = db.query(Judge).filter(Judge.name == judge.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A judge with this name already exists")
    new_judge = Judge(**judge.dict())
    db.add(new_judge)
    db.commit()
    db.refresh(new_judge)
    return new_judge


@router.put("/{judge_id}")
def update_judge(judge_id: int, judge: JudgeIn, db: Session = Depends(get_db)):
    existing = db.query(Judge).filter(Judge.id == judge_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Judge not found")
    for k, v in judge.dict().items():
        setattr(existing, k, v)
    db.commit()
    return existing


@router.delete("/{judge_id}")
def delete_judge(judge_id: int, db: Session = Depends(get_db)):
    existing = db.query(Judge).filter(Judge.id == judge_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Judge not found")
    db.delete(existing)
    db.commit()
    return {"deleted": judge_id}


@router.post("/seed-demo")
def seed_demo_judges(db: Session = Depends(get_db)):
    """Quick helper to populate a few sample judges for testing."""
    demo = [
        {"name": "Judge A. Sharma", "specialization": "Criminal", "max_daily_capacity": 8},
        {"name": "Judge P. Verma", "specialization": "Civil", "max_daily_capacity": 6},
        {"name": "Judge K. Nair", "specialization": "Family", "max_daily_capacity": 7},
        {"name": "Judge R. Iyer", "specialization": "Property", "max_daily_capacity": 6},
        {"name": "Judge S. Das", "specialization": "General", "max_daily_capacity": 8},
    ]
    created = 0
    for d in demo:
        if not db.query(Judge).filter(Judge.name == d["name"]).first():
            db.add(Judge(**d))
            created += 1
    db.commit()
    return {"created": created}
