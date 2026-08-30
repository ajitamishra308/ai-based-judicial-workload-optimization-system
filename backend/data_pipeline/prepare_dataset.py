"""
Data pipeline: converts the raw datasets (Supreme Court judgments metadata,
or district-court pendency CSVs) into the column format the /api/cases/upload
endpoint expects.

Usage:
    python prepare_dataset.py --input data/raw/sc_metadata.csv --output data/processed/cases_ready.csv
"""
import argparse
import pandas as pd

# Map common column names found in the real datasets -> our schema
COLUMN_ALIASES = {
    "case_id": ["case_id", "cnr", "citation", "id"],
    "title": ["title", "case_title", "case_name"],
    "petitioner": ["petitioner", "petitioner_name", "appellant"],
    "respondent": ["respondent", "respondent_name"],
    "court": ["court", "court_name"],
    "case_type": ["case_type", "category", "type"],
    "stage": ["stage", "case_stage", "status_stage"],
    "decision_date": ["decision_date", "date_of_judgment", "judgment_date", "date"],
    "disposal_nature": ["disposal_nature", "status", "case_status"],
    "full_text": ["full_text", "text", "judgment_text", "raw_text"],
}


def find_column(df_columns, aliases):
    lower_cols = {c.lower(): c for c in df_columns}
    for alias in aliases:
        if alias in lower_cols:
            return lower_cols[alias]
    return None


def prepare(input_path: str, output_path: str):
    df = pd.read_csv(input_path)
    out = pd.DataFrame()

    for target_col, aliases in COLUMN_ALIASES.items():
        source_col = find_column(df.columns, aliases)
        out[target_col] = df[source_col] if source_col else None

    # Fill sensible defaults for anything still missing
    out["case_type"] = out["case_type"].fillna("Others")
    out["stage"] = out["stage"].fillna("Admission")
    out["disposal_nature"] = out["disposal_nature"].fillna("Pending")
    out["title"] = out["title"].fillna("Untitled Case")

    out.to_csv(output_path, index=False)
    print(f"Wrote {len(out)} rows to {output_path}")
    print(f"Columns: {list(out.columns)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    prepare(args.input, args.output)
