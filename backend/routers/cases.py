"""
Cases router -- CRUD operations + the dataset upload endpoint.

This is the file that handles "upload your CSV dataset" from the frontend.
"""
import csv
import io

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, Case, init_db

router = APIRouter()
init_db()

# Columns we expect in an uploaded dataset. Extra columns are ignored;
# missing ones are filled with sensible defaults so upload never hard-fails.
EXPECTED_COLUMNS = {
    "case_id": None, "title": "Untitled Case", "petitioner": "", "respondent": "",
    "court": "District Court", "case_type": "Others", "stage": "Admission",
    "decision_date": None, "disposal_nature": "Pending", "full_text": "",
}


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a CSV file of cases (e.g. the Supreme Court judgments dataset,
    or the district-court pendency dataset). Rows are inserted/updated in the DB.

    Expected columns (case-insensitive, extras ignored):
    case_id, title, petitioner, respondent, court, case_type, stage,
    decision_date, disposal_nature, full_text
    """
    if not file.filename.endswith((".csv", ".CSV")):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise ValueError("CSV file is empty or missing a header row")

        fieldnames = {str(name).strip().lower(): str(name).strip() for name in reader.fieldnames if name is not None}
        rows = []
        for row in reader:
            cleaned = {}
            for raw_key, raw_value in row.items():
                if raw_key is None:
                    continue
                normalized_key = str(raw_key).strip().lower()
                cleaned[normalized_key] = raw_value
            rows.append(cleaned)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    inserted, updated, skipped = 0, 0, 0
    for row in rows:
        case_id = str(row.get("case_id") or row.get("cnr") or row.get("citation") or "").strip()
        if not case_id:
            skipped += 1
            continue

        existing = db.query(Case).filter(Case.case_id == case_id).first()
        values = {}
        for key, default in EXPECTED_COLUMNS.items():
            if key == "case_id":
                continue
            mapped_key = key
            if mapped_key in row:
                value = row.get(mapped_key)
            else:
                value = default
            if value is None or value == "":
                value = default
            values[key] = value

        if existing:
            for k, v in values.items():
                setattr(existing, k, v)
            updated += 1
        else:
            db.add(Case(case_id=case_id, **values))
            inserted += 1

    db.commit()
    return {
        "filename": file.filename,
        "rows_in_file": len(rows),
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped,
    }


@router.get("/")
def list_cases(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    cases = db.query(Case).offset(skip).limit(limit).all()
    total = db.query(func.count(Case.id)).scalar()
    return {"total": total, "cases": cases}


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    """Powers the top stat cards + donut chart on the dashboard."""
    total = db.query(func.count(Case.id)).scalar() or 0
    disposed = db.query(func.count(Case.id)).filter(Case.disposal_nature == "Disposed").scalar() or 0

    type_counts = (
        db.query(Case.case_type, func.count(Case.id))
        .group_by(Case.case_type)
        .all()
    )
    by_type = {t or "Others": c for t, c in type_counts}

    return {
        "total_cases": total,
        "disposed_cases": disposed,
        "pending_cases": total - disposed,
        "cases_by_type": by_type,
    }


@router.get("/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
