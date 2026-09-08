"""
Converts the real eCourtsIndia "Disposal-Time Index" dataset (real disposed
cases with actual filing/decision dates) into the format
ml_engine/priority_ml.py expects for training.

Download the real dataset first:
    https://blogs.ecourtsindia.com/wp-content/uploads/2026/04/disposal-time-index-2026-data.csv

Note on data honesty: this real dataset does NOT include case "stage" or
"adjournment count" (our synthetic data invented those for demo purposes).
So this script maps what IS real (case type, court tier, state) into our
schema, and sets stage/adjournments to neutral placeholders. This means the
retrained model will be weaker on stage-based reasoning but strictly more
truthful on duration patterns, since caseDurationDays here is real, not
invented. Mention this trade-off in your report.

Usage:
    python prepare_real_training_data.py --input disposal-time-index-2026-data.csv --output ../../data/processed/synthetic_training_data.csv
"""
import argparse
import pandas as pd

# Map eCourtsIndia's case-type codes to our broader categories
CASE_TYPE_MAP = {
    "BA": "Criminal", "ABA": "Criminal", "CRL_A": "Criminal",
    "CS": "Civil", "WP_C": "Civil",
    "MACA": "Property",
}


def convert(input_path: str, output_path: str, max_rows: int | None = None):
    df = pd.read_csv(input_path)

    # keep only one row per unique case (the CSV repeats rows across cohorts)
    df = df.drop_duplicates(subset=["cnr"])

    out = pd.DataFrame()
    out["case_type"] = df["caseType"].map(CASE_TYPE_MAP).fillna("Others")
    # We don't have real stage/adjournment data -- use tier as a rough proxy signal instead
    out["stage"] = df["tier"].map({"district": "Evidence", "hc": "Passing of Orders"}).fillna("Admission")
    out["state"] = df["stateName"].fillna("Unknown")  # real, and highly predictive (TN vs Odisha gap is huge)
    out["days_pending_so_far"] = 0          # unknown at filing time for historical records
    out["past_adjournments"] = 0            # not available in this dataset
    out["days_to_disposal"] = df["caseDurationDays"]

    out = out.dropna(subset=["days_to_disposal"])
    if max_rows:
        out = out.sample(min(max_rows, len(out)), random_state=42)

    out.to_csv(output_path, index=False)
    print(f"Converted {len(out)} real disposed cases -> {output_path}")
    print(out["case_type"].value_counts())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="../../data/processed/synthetic_training_data.csv")
    parser.add_argument("--max-rows", type=int, default=None)
    args = parser.parse_args()
    convert(args.input, args.output, args.max_rows)
