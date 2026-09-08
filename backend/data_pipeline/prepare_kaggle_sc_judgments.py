"""
Converts the Kaggle "Indian Supreme Court Judgments" dataset
(diary_no, case_no, pet, res, judgement_by, judgment_dates, ...) into the
column format cases.py's /upload endpoint expects.

Honesty note: this dataset has case metadata only -- NOT the judgment's
full text (just a PDF filename on the source server). So after uploading,
Summarization and AI Clustering (which need full_text) will simply skip
these rows -- they won't error, they just won't have anything to
summarize/cluster. This data is genuinely useful for: dashboard case
counts, Reports & Analytics charts (by case type, by year, by judge), and
demonstrating the pipeline at real scale (47,400 real Supreme Court cases).

Usage:
    python prepare_kaggle_sc_judgments.py --input judgments.csv --output ../../data/processed/sc_judgments_ready.csv --max-rows 5000
"""
import argparse
import re
import pandas as pd

# Rough case-type inference from the case_no prefix (e.g. "Crl.A. No.-..." -> Criminal)
CASE_NO_TYPE_MAP = {
    "C.A.": "Civil", "Crl.A.": "Criminal", "W.P.(C)": "Civil", "SLP(C)": "Civil",
    "SLP(Crl)": "Criminal", "W.P.(Crl.)": "Criminal", "T.P.(C)": "Civil",
    "T.P.(Crl.)": "Criminal", "CONMT.PET.(C)": "Civil", "MA": "Others",
    "R.P.(C)": "Civil", "R.P.(Crl.)": "Criminal", "T.C.(C)": "Civil",
    "ARBIT.PETITON": "Civil", "Appeal": "Others",
}


def infer_case_type(case_no: str) -> str:
    if not isinstance(case_no, str):
        return "Others"
    match = re.match(r"^([A-Za-z\.\(\)]+)", case_no.strip())
    prefix = match.group(1) if match else ""
    return CASE_NO_TYPE_MAP.get(prefix, "Others")


def convert(input_path: str, output_path: str, max_rows: int | None = None):
    df = pd.read_csv(input_path)
    df = df.dropna(subset=["diary_no", "pet", "res"])

    if max_rows:
        df = df.sample(min(max_rows, len(df)), random_state=42)

    out = pd.DataFrame()
    out["case_id"] = df["diary_no"].astype(str)
    out["title"] = df["pet"].str.title() + " vs " + df["res"].str.title()
    out["petitioner"] = df["pet"].str.title()
    out["respondent"] = df["res"].str.title()
    out["court"] = "Supreme Court of India"
    out["case_type"] = df["case_no"].apply(infer_case_type)
    out["stage"] = "Judgment Awaited"  # these are all delivered judgments -- final stage
    # dates come as DD-MM-YYYY; convert to YYYY-MM-DD for the app
    out["decision_date"] = pd.to_datetime(df["judgment_dates"], format="%d-%m-%Y", errors="coerce").dt.strftime("%Y-%m-%d")
    out["disposal_nature"] = "Disposed"  # all rows in this dataset are delivered judgments
    out["full_text"] = ""  # not available in this dataset -- see note above

    out = out.dropna(subset=["decision_date"])
    out.to_csv(output_path, index=False)

    print(f"Converted {len(out)} cases -> {output_path}")
    print("\nCase type breakdown:")
    print(out["case_type"].value_counts())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="../../data/processed/sc_judgments_ready.csv")
    parser.add_argument("--max-rows", type=int, default=None, help="Sample a subset for faster upload/demo")
    args = parser.parse_args()
    convert(args.input, args.output, args.max_rows)
