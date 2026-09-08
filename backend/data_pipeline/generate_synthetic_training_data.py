"""
Generates synthetic historical case data to train the priority-ranking ML
model, until real disposal-outcome data is available from a court.

Why synthetic: real datasets we have (Supreme Court judgments, NJDG
aggregates) don't include per-case "how many days did THIS case take to
resolve" -- which is exactly the label a ranking model needs. This script
creates a realistic-but-fake dataset with plausible relationships (e.g.
Criminal cases at Final Arguments resolve faster; cases with more
adjournments take longer) so the ML pipeline can be built and demoed now,
then re-trained on real data later without any code changes.
"""
import numpy as np
import pandas as pd
import argparse

CASE_TYPES = ["Criminal", "Civil", "Family", "Property", "Others"]
STAGES = ["Admission", "Framing of Charges", "Evidence", "Passing of Orders", "Final Arguments", "Judgment Awaited"]
COURTS = ["District Court Delhi", "District Court Mumbai", "District Court Lucknow", "District Court Pune"]

STAGE_ORDER = {s: i for i, s in enumerate(STAGES)}  # later stage = closer to done


def generate(n_rows: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    case_type = rng.choice(CASE_TYPES, n_rows, p=[0.25, 0.30, 0.20, 0.15, 0.10])
    stage = rng.choice(STAGES, n_rows)
    court = rng.choice(COURTS, n_rows)
    days_pending_so_far = rng.integers(10, 1500, n_rows)
    past_adjournments = rng.poisson(3, n_rows)

    # --- Simulate a realistic "days until disposal" target ---
    base_days = np.zeros(n_rows)
    for i in range(n_rows):
        stage_factor = (len(STAGES) - STAGE_ORDER[stage[i]]) * 40      # later stage -> fewer days left
        type_factor = {"Criminal": 60, "Family": 90, "Civil": 120, "Property": 150, "Others": 100}[case_type[i]]
        adjournment_penalty = past_adjournments[i] * 25                # more adjournments -> more delay
        noise = rng.normal(0, 30)
        base_days[i] = max(5, stage_factor + type_factor * 0.3 + adjournment_penalty + noise)

    df = pd.DataFrame({
        "case_type": case_type,
        "stage": stage,
        "court": court,
        "days_pending_so_far": days_pending_so_far,
        "past_adjournments": past_adjournments,
        "days_to_disposal": base_days.round(0).astype(int),  # <-- training label
    })
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=3000)
    parser.add_argument("--output", default="data/processed/synthetic_training_data.csv")
    args = parser.parse_args()

    df = generate(args.rows)
    df.to_csv(args.output, index=False)
    print(f"Generated {len(df)} synthetic training rows -> {args.output}")
    print(df.head())
