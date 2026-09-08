"""
Extracts real judgment TEXT from PDFs downloaded from the vanga/indian-
supreme-court-judgments AWS Open Data bucket (year=2023 English archive),
matches each PDF to its metadata JSON, and produces a CSV with full_text
populated -- ready to upload via Case Intake, and usable by AI Clustering
+ Summarization (unlike the Kaggle metadata-only CSV, which has no text).

VERIFIED against the real dataset (not a guess) -- the metadata JSON files
store everything inside one "raw_html" field (a fragment of the eCourts
website), not clean keys. This script regex-parses that HTML for:
petitioner, respondent, decision date, case number, disposal nature.

SETUP:
    1. Download + extract year 2023 data:
       curl -O https://indian-supreme-court-judgments.s3.amazonaws.com/data/tar/year=2023/english/english.tar
       curl -O https://indian-supreme-court-judgments.s3.amazonaws.com/metadata/tar/year=2023/metadata.tar
       mkdir pdfs metadata_json
       tar -xf english.tar -C pdfs
       tar -xf metadata.tar -C metadata_json

    2. pip install pdfplumber

    3. Run on a sample (fast, good for a demo):
       python extract_real_judgment_text.py --pdf-dir pdfs --metadata-dir metadata_json --output ../../data/processed/real_judgments_with_text.csv --max-files 150
"""
import argparse
import json
import os
import re
import glob


def extract_pdf_text(pdf_path: str, max_chars: int = 6000) -> str:
    import pdfplumber
    text_parts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages[:6]:
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
                if sum(len(t) for t in text_parts) > max_chars:
                    break
    except Exception:
        return ""
    return " ".join(text_parts)[:max_chars].strip()


def parse_metadata_html(html: str) -> dict:
    """The real metadata format: everything is packed into one raw_html string."""
    def find(pattern, default=""):
        m = re.search(pattern, html)
        return m.group(1).strip() if m else default

    title_match = re.search(r"<strong>(.*?)<span class='fst-italic'> versus </span>(.*?)</strong>", html)
    petitioner = title_match.group(1).strip() if title_match else "Unknown Petitioner"
    respondent = title_match.group(2).strip() if title_match else "Unknown Respondent"

    return {
        "petitioner": petitioner,
        "respondent": respondent,
        "decision_date": find(r"Decision Date :</span><font color=.green.>(.*?)</font>"),
        "case_no": find(r"Case No :</span><font color=.green.>(.*?)</font>"),
        "disposal_nature": find(r"Disposal Nature :</span><font color=.green.>(.*?)</font>", "Disposed"),
    }


def infer_case_type(case_no: str, text: str) -> str:
    combined = f"{case_no} {text[:500]}".lower()
    if any(w in combined for w in ["writ petition (crl", "criminal appeal", "crl.a", "bail", "ipc", "accused"]):
        return "Criminal"
    if any(w in combined for w in ["divorce", "custody", "matrimonial", "maintenance"]):
        return "Family"
    if any(w in combined for w in ["land", "possession", "tenancy", "property"]):
        return "Property"
    return "Civil"


def convert_date(raw_date: str) -> str:
    """Converts DD-MM-YYYY (as seen in the real data) to YYYY-MM-DD for the app."""
    m = re.match(r"(\d{2})-(\d{2})-(\d{4})", raw_date)
    if m:
        d, mo, y = m.groups()
        return f"{y}-{mo}-{d}"
    return ""


def run(pdf_dir: str, metadata_dir: str, output_path: str, max_files: int):
    pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "**", "*.pdf"), recursive=True))[:max_files]
    print(f"Found {len(pdf_files)} PDFs to process (capped at {max_files})")

    rows, skipped = [], 0
    for i, pdf_path in enumerate(pdf_files, 1):
        base = os.path.splitext(os.path.basename(pdf_path))[0]
        base_key = "_".join(base.split("_")[:4])  # e.g. "2023_7_322_346_EN" -> "2023_7_322_346"

        json_candidates = glob.glob(os.path.join(metadata_dir, "**", f"{base_key}.json"), recursive=True)
        if not json_candidates:
            skipped += 1
            continue

        with open(json_candidates[0]) as f:
            meta_raw = json.load(f)
        meta = parse_metadata_html(meta_raw.get("raw_html", ""))

        text = extract_pdf_text(pdf_path)
        if not text:
            skipped += 1
            continue

        rows.append({
            "case_id": base_key,
            "title": f"{meta['petitioner']} vs {meta['respondent']}"[:150],
            "petitioner": meta["petitioner"],
            "respondent": meta["respondent"],
            "court": "Supreme Court of India",
            "case_type": infer_case_type(meta["case_no"], text),
            "stage": "Judgment Awaited",
            "decision_date": convert_date(meta["decision_date"]),
            "disposal_nature": "Disposed",
            "full_text": text,
        })

        if i % 25 == 0:
            print(f"  processed {i}/{len(pdf_files)}...")

    import pandas as pd
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"\nDone: {len(df)} real judgments with extracted text -> {output_path} ({skipped} skipped)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", required=True)
    parser.add_argument("--metadata-dir", required=True)
    parser.add_argument("--output", default="../../data/processed/real_judgments_with_text.csv")
    parser.add_argument("--max-files", type=int, default=150)
    args = parser.parse_args()
    run(args.pdf_dir, args.metadata_dir, args.output, args.max_files)
