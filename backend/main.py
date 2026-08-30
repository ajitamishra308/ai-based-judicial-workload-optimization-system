from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import cases, causelist, clusters, summarize

app = FastAPI(title="Nyaya Setu API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix="/api/cases")
app.include_router(clusters.router, prefix="/api/clusters")
app.include_router(causelist.router, prefix="/api/causelist")
app.include_router(summarize.router, prefix="/api/summarize")


@app.get("/")
def root():
    return {"message": "Nyaya Setu API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
