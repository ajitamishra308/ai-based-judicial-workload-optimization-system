from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, Case
from ml_engine.summarizer import summarize_text

router = APIRouter()


class SummarizeRequest(BaseModel):
    text: str


@router.post("/text")
def summarize_raw_text(req: SummarizeRequest):
    """Summarize arbitrary text passed directly (no DB lookup)."""
    summary = summarize_text(req.text)
    return {"summary": summary}


@router.post("/case/{case_id}")
def summarize_case(case_id: str, db: Session = Depends(get_db)):
    """Summarize a case already in the database, and save the result."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case or not case.full_text:
        raise HTTPException(status_code=404, detail="Case not found or has no text")

    summary = summarize_text(case.full_text)
    case.summary = summary
    db.commit()
    return {"case_id": case_id, "summary": summary}
