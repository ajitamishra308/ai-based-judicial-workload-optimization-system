"""
Priority scoring module -- decides which pending cases should be heard sooner.

Approach: weighted rule-based scoring (transparent + explainable, which
matters a lot for a judicial-system project -- evaluators will ask
"why did the model rank this case first?" and this is easy to answer).

Can be swapped for a trained ML ranking model later (8th sem extension)
without changing the API shape.
"""
from datetime import datetime, date

# Higher stage weight = case is closer to conclusion = higher priority
STAGE_WEIGHTS = {
    "Final Arguments": 1.0,
    "Judgment Awaited": 0.95,
    "Evidence": 0.7,
    "Passing of Orders": 0.6,
    "Framing of Charges": 0.4,
    "Admission": 0.2,
}

CASE_TYPE_WEIGHTS = {
    "Criminal": 1.0,   # personal liberty at stake -> higher urgency
    "Family": 0.8,
    "Civil": 0.6,
    "Property": 0.5,
    "Others": 0.4,
}


def compute_priority_score(stage: str, case_type: str, filing_date: str | None) -> float:
    """
    Returns a priority score between 0 and 1 (higher = more urgent).
    Combines: how far along the case is (stage), case category, and pendency age.
    """
    stage_score = STAGE_WEIGHTS.get(stage, 0.3)
    type_score = CASE_TYPE_WEIGHTS.get(case_type, 0.4)

    age_score = 0.5
    if filing_date:
        try:
            filed = datetime.strptime(filing_date, "%Y-%m-%d").date()
            days_pending = (date.today() - filed).days
            # Cases pending > 3 years get near-max urgency boost
            age_score = min(1.0, days_pending / (365 * 3))
        except ValueError:
            pass

    # Weighted combination -- tune these weights based on domain feedback
    final_score = (0.45 * stage_score) + (0.25 * type_score) + (0.30 * age_score)
    return round(final_score, 3)


def rank_cases(cases: list[dict]) -> list[dict]:
    """
    Takes a list of case dicts (each with stage, case_type, filing_date)
    and returns them sorted by priority_score descending, with the score attached.
    """
    for c in cases:
        c["priority_score"] = compute_priority_score(
            c.get("stage", ""), c.get("case_type", ""), c.get("filing_date")
        )
    return sorted(cases, key=lambda x: x["priority_score"], reverse=True)
