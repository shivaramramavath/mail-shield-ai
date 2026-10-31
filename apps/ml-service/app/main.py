from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("mailshield.ml")

BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = BASE_DIR / "models" / "spam_pipeline.joblib"
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH)))

_model_bundle: dict | None = None


def load_model() -> dict:
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model artifact not found at {MODEL_PATH}. "
            "Run: python training/train.py"
        )

    bundle = joblib.load(MODEL_PATH)
    if not isinstance(bundle, dict) or "pipeline" not in bundle:
        raise RuntimeError("Invalid model artifact. Retrain with training/train.py.")
    return bundle


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model_bundle
    _model_bundle = load_model()
    logger.info(
        "Loaded model version=%s from %s",
        _model_bundle.get("model_version", "unknown"),
        MODEL_PATH,
    )
    yield
    _model_bundle = None


app = FastAPI(
    title="MailShield AI — ML Service",
    version="1.0.0",
    description="Email spam/ham classification using a trained scikit-learn pipeline.",
    lifespan=lifespan,
)


class PredictRequest(BaseModel):
    text: str = Field(min_length=3, max_length=20000)


class PredictResponse(BaseModel):
    label: Literal["spam", "ham"]
    spam_probability: float = Field(ge=0.0, le=1.0)
    ham_probability: float = Field(ge=0.0, le=1.0)
    duration_ms: float = Field(ge=0.0)
    model_version: str


class BatchPredictRequest(BaseModel):
    emails: list[str] = Field(min_length=1, max_length=20)


def get_bundle() -> dict:
    if _model_bundle is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")
    return _model_bundle


def classify_text(text: str) -> dict:
    bundle = get_bundle()
    pipeline = bundle["pipeline"]
    threshold = float(bundle.get("spam_threshold", 0.5))

    started = time.perf_counter()
    probabilities = pipeline.predict_proba([text])[0]
    elapsed_ms = (time.perf_counter() - started) * 1000

    classes = list(pipeline.classes_)
    try:
        spam_index = classes.index(1)
        ham_index = classes.index(0)
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail="Loaded model does not contain expected classes 0 and 1.",
        ) from exc

    spam_probability = float(probabilities[spam_index])
    ham_probability = float(probabilities[ham_index])
    label = "spam" if spam_probability >= threshold else "ham"

    return {
        "label": label,
        "spam_probability": round(spam_probability, 6),
        "ham_probability": round(ham_probability, 6),
        "duration_ms": round(elapsed_ms, 3),
        "model_version": str(bundle.get("model_version", "unknown")),
    }


@app.get("/")
def root():
    return {
        "name": "MailShield AI ML Service",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    bundle = _model_bundle
    return {
        "status": "ok" if bundle is not None else "model_not_loaded",
        "model_loaded": bundle is not None,
        "model_version": (
            str(bundle.get("model_version")) if bundle is not None else None
        ),
    }


@app.get("/model/info")
def model_info():
    bundle = get_bundle()
    return {
        "model_version": bundle.get("model_version", "unknown"),
        "algorithm": bundle.get("algorithm", "unknown"),
        "trained_at": bundle.get("trained_at"),
        "dataset_rows": bundle.get("dataset_rows"),
        "spam_threshold": bundle.get("spam_threshold", 0.5),
        "metrics": bundle.get("metrics", {}),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    return classify_text(request.text.strip())


@app.post("/predict/batch")
def predict_batch(request: BatchPredictRequest):
    if any(not isinstance(email, str) or len(email.strip()) < 3 for email in request.emails):
        raise HTTPException(status_code=422, detail="Every email must contain at least 3 characters.")

    results = []
    for index, email in enumerate(request.emails):
        try:
            results.append({"index": index, **classify_text(email.strip())})
        except HTTPException as exc:
            results.append({"index": index, "error": exc.detail})

    return {"total": len(request.emails), "results": results}
