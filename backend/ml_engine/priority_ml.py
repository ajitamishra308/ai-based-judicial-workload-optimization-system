"""
ML-based priority scoring -- predicts how many days a pending case will
likely take to reach disposal, then converts that into a 0-1 priority
score (fewer predicted days remaining = higher priority = closer to top
of the cause list).

This is the 8th-sem upgrade of ml_engine/priority.py's rule-based scoring.
Same input/output shape (case dict -> priority_score) so nothing else in
the codebase (routers, frontend) needs to change.

Falls back to the rule-based scorer automatically if no trained model
exists yet -- so the app never breaks, it just gets smarter once trained.
"""
import os
from functools import lru_cache

import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "priority_model.txt")

CASE_TYPES = ["Criminal", "Civil", "Family", "Property", "Others"]
STAGES = ["Admission", "Framing of Charges", "Evidence", "Passing of Orders", "Final Arguments", "Judgment Awaited"]
STATES = ["Tamil Nadu", "West Bengal", "Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat",
          "Kerala", "Rajasthan", "Uttar Pradesh", "Odisha", "Delhi", "Andhra Pradesh", "Bihar", "Unknown"]

FEATURE_COLUMNS = ["case_type", "stage", "state", "days_pending_so_far", "past_adjournments"]


@lru_cache(maxsize=1)
def _load_model():
    import lightgbm as lgb

    booster = lgb.Booster(model_file=MODEL_PATH)
    with open(MODEL_PATH + ".columns") as f:
        trained_columns = f.read().split(",")
    return booster, trained_columns


def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """One-hot encode categoricals, keeping columns consistent between train/predict."""
    df = df.copy()
    if "state" not in df.columns:
        df["state"] = "Unknown"
    df["case_type"] = pd.Categorical(df["case_type"], categories=CASE_TYPES)
    df["stage"] = pd.Categorical(df["stage"], categories=STAGES)
    df["state"] = pd.Categorical(df["state"].fillna("Unknown"), categories=STATES)
    return pd.get_dummies(df[FEATURE_COLUMNS], columns=["case_type", "stage", "state"])


def train_priority_model(csv_path: str) -> dict:
    """
    Trains a LightGBM regressor on historical case data.
    Expected columns in csv_path: case_type, stage, days_pending_so_far,
    past_adjournments, days_to_disposal (the label).

    Case durations are heavily right-skewed (many cases resolve in days,
    a long tail takes years) -- we train on log(days_to_disposal) and
    exponentiate back at prediction time, which is standard practice for
    this kind of duration data and improves fit substantially.
    """
    import numpy as np
    import lightgbm as lgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error

    df = pd.read_csv(csv_path)
    X = _prepare_features(df)
    y_log = np.log1p(df["days_to_disposal"])

    X_train, X_test, y_train, y_test = train_test_split(X, y_log, test_size=0.2, random_state=42)

    model = lgb.LGBMRegressor(n_estimators=150, max_depth=6, learning_rate=0.05, random_state=42)
    model.fit(X_train, y_train)

    preds_log = model.predict(X_test)
    # evaluate error back in real days, not log-days, so the number is interpretable
    mae_days = mean_absolute_error(np.expm1(y_test), np.expm1(preds_log))

    model.booster_.save_model(MODEL_PATH)
    with open(MODEL_PATH + ".columns", "w") as f:
        f.write(",".join(X.columns))
    _load_model.cache_clear()

    return {"trained_on_rows": len(df), "mean_absolute_error_days": round(float(mae_days), 1)}


def is_model_trained() -> bool:
    return os.path.exists(MODEL_PATH)


def predict_priority_ml(case_type: str, stage: str, days_pending_so_far: int, past_adjournments: int, state: str = "Unknown") -> float:
    """Returns a priority score in [0,1]. Higher = more urgent (fewer days left)."""
    import numpy as np

    booster, trained_columns = _load_model()

    row = pd.DataFrame([{
        "case_type": case_type, "stage": stage, "state": state,
        "days_pending_so_far": days_pending_so_far, "past_adjournments": past_adjournments,
    }])
    X = _prepare_features(row)
    X = X.reindex(columns=trained_columns, fill_value=0)  # align with training-time columns

    predicted_log_days = booster.predict(X)[0]
    predicted_days = max(1, np.expm1(predicted_log_days))  # model was trained on log(days) -- invert here
    score = 1 / (1 + predicted_days / 90)  # 90-day soft scale, tune as needed
    return round(float(score), 3)


def predict_priority_ml_batch(rows: list[dict]) -> list[float]:
    """Scores many cases with one model call instead of reinitializing prediction per row."""
    import numpy as np

    if not rows:
        return []

    booster, trained_columns = _load_model()
    frame = pd.DataFrame(rows)
    frame["state"] = frame.get("state", "Unknown")
    frame["past_adjournments"] = frame.get("past_adjournments", 0)
    frame["days_pending_so_far"] = frame.get("days_pending_so_far", 0)
    frame["case_type"] = frame["case_type"].fillna("Others")
    frame["stage"] = frame["stage"].fillna("Admission")
    features = _prepare_features(frame)
    features = features.reindex(columns=trained_columns, fill_value=0)

    predicted_log_days = booster.predict(features)
    predicted_days = np.maximum(1, np.expm1(predicted_log_days))
    scores = 1 / (1 + predicted_days / 90)
    return [round(float(score), 3) for score in scores]
