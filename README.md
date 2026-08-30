# Nyaya Setu — AI-Based Court Case Triage & Judicial Workload Optimization

Final year project: an AI system that summarizes court cases, clusters similar
cases together, and generates a priority-ranked cause list to help optimize
judicial workload.

## Project Structure

```
nyaya-project/
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── database.py               # SQLAlchemy models (SQLite by default)
│   ├── requirements.txt
│   ├── routers/
│   │   ├── cases.py               # CRUD + dataset upload endpoint
│   │   ├── clusters.py            # clustering endpoints
│   │   ├── causelist.py           # priority ranking endpoints
│   │   └── summarize.py           # summarization endpoints
│   ├── ml_engine/
│   │   ├── summarizer.py          # transformer-based summarization
│   │   ├── clustering.py          # embeddings + KMeans clustering
│   │   └── priority.py            # rule-based priority scoring
│   └── data_pipeline/
│       └── prepare_dataset.py     # converts raw datasets into upload-ready CSV
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/            # Sidebar, Header, StatCard, charts, tables
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # main dashboard (matches design mockup)
│   │   │   └── CaseIntake.jsx     # dataset upload page
│   │   └── api/client.js          # API calls to backend
│   └── package.json
└── data/
    └── raw/sample_cases.csv       # sample data to test the pipeline immediately
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```


First run will download the ML models (~1.6GB for BART summarizer, ~90MB for
the sentence-transformer) — this only happens once.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```


### 3. Load data

Two ways:
- **Easiest:** Open the app → "Case Intake" in the sidebar → upload
  `data/raw/sample_cases.csv` to test the full pipeline immediately.
- **Real datasets:** Download the Supreme Court judgments dataset or district
  pendency CSVs (see project chat history for free download links), run them
  through `backend/data_pipeline/prepare_dataset.py` to normalize columns,
  then upload the resulting CSV via the Case Intake page.

### 4. Run clustering (after uploading data)

```bash
curl -X POST "http://localhost:8000/api/clusters/run?n_clusters=5"
```

Or call it from a "Run Clustering" button you add to the AI Case Triage page.

## What's AI/ML vs plain code

| Feature | Type | Where |
|---|---|---|
| Dataset upload/cleaning | Software engineering | `routers/cases.py` |
| Case summarization | NLP (transformer model) | `ml_engine/summarizer.py` |
| Similar-case clustering | ML (embeddings + KMeans) | `ml_engine/clustering.py` |
| Cause-list priority ranking | Rule-based scoring (swap for ML model in 8th sem) | `ml_engine/priority.py` |
| Dashboard/API | Software engineering | `main.py`, `App.jsx` |

## Next steps / 8th-sem extension ideas

- Replace rule-based priority scoring with a trained ranking model
- Add adjournment-prediction classifier (Random Forest/XGBoost)
- Add authentication for multi-user (judge/clerk) roles
- Deploy backend (Render/Railway) + frontend (Vercel/Netlify)
