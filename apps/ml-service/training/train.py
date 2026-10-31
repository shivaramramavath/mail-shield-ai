from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline

ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "datasets" / "spam_ham_dataset.csv"
MODEL_DIR = ROOT / "models"
MODEL_PATH = MODEL_DIR / "spam_pipeline.joblib"
METRICS_PATH = MODEL_DIR / "evaluation_metrics.json"
RANDOM_STATE = 42


def load_dataset() -> tuple[list[str], list[int]]:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}\n"
            "Place spam_ham_dataset.csv inside the datasets directory."
        )

    df = pd.read_csv(DATASET_PATH)

    required = {"text", "label_num"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(
            f"Dataset is missing columns: {sorted(missing)}. "
            f"Found: {list(df.columns)}"
        )

    df = df[["text", "label_num"]].dropna().copy()
    df["text"] = df["text"].astype(str).str.strip()
    df["label_num"] = pd.to_numeric(df["label_num"], errors="coerce")
    df = df.dropna(subset=["label_num"])
    df = df[df["text"].str.len() >= 3]
    df["label_num"] = df["label_num"].astype(int)

    invalid_labels = sorted(set(df["label_num"].unique()) - {0, 1})
    if invalid_labels:
        raise ValueError(f"label_num must contain only 0 (ham) and 1 (spam). Found: {invalid_labels}")

    if "label" in pd.read_csv(DATASET_PATH, nrows=0).columns:
        original = pd.read_csv(DATASET_PATH, usecols=["label", "label_num"])
        original = original.dropna()
        normalized = original["label"].astype(str).str.strip().str.lower()
        expected = normalized.map({"ham": 0, "spam": 1})
        valid = expected.notna()
        mismatch = int((expected[valid].astype(int) != original.loc[valid, "label_num"].astype(int)).sum())
        if mismatch:
            raise ValueError(
                f"Found {mismatch} rows where label and label_num disagree."
            )

    if df["label_num"].nunique() != 2:
        raise ValueError("Training requires both ham (0) and spam (1) examples.")

    return df["text"].tolist(), df["label_num"].tolist()


def build_pipeline() -> Pipeline:
    # Word features capture phrases; character features help with obfuscation,
    # misspellings, and unusual token formatting.
    features = FeatureUnion(
        [
            (
                "word_tfidf",
                TfidfVectorizer(
                    analyzer="word",
                    ngram_range=(1, 2),
                    min_df=2,
                    max_features=250_000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    dtype="float32",
                ),
            ),
            (
                "char_tfidf",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=2,
                    max_features=150_000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    dtype="float32",
                ),
            ),
        ]
    )

    return Pipeline(
        steps=[
            ("features", features),
            (
                "classifier",
                LogisticRegression(
                    max_iter=2000,
                    solver="liblinear",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def main() -> None:
    texts, labels = load_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=labels,
    )

    pipeline = build_pipeline()
    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows:  {len(X_test)}")
    print("Training TF-IDF + Logistic Regression pipeline...")

    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)[:, list(pipeline.classes_).index(1)]

    metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "spam_precision": float(precision_score(y_test, predictions, pos_label=1, zero_division=0)),
        "spam_recall": float(recall_score(y_test, predictions, pos_label=1, zero_division=0)),
        "spam_f1": float(f1_score(y_test, predictions, pos_label=1, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, probabilities)),
        "confusion_matrix_labels_order": ["ham (0)", "spam (1)"],
        "confusion_matrix": confusion_matrix(y_test, predictions, labels=[0, 1]).tolist(),
        "classification_report": classification_report(
            y_test,
            predictions,
            labels=[0, 1],
            target_names=["ham", "spam"],
            output_dict=True,
            zero_division=0,
        ),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "dataset_rows": len(texts),
        "random_state": RANDOM_STATE,
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "pipeline": pipeline,
        "model_version": "mailshield-tfidf-logreg-v1",
        "algorithm": "Word + character TF-IDF with Logistic Regression",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_rows": len(texts),
        "spam_threshold": 0.5,
        "metrics": metrics,
        "label_mapping": {"0": "ham", "1": "spam"},
    }
    joblib.dump(bundle, MODEL_PATH, compress=3)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print("\nEvaluation on held-out test data")
    print(f"Accuracy:       {metrics['accuracy']:.4f}")
    print(f"Spam precision:{metrics['spam_precision']:.4f}")
    print(f"Spam recall:    {metrics['spam_recall']:.4f}")
    print(f"Spam F1:        {metrics['spam_f1']:.4f}")
    print(f"ROC AUC:        {metrics['roc_auc']:.4f}")
    print("\nConfusion matrix [ham, spam]:")
    print(metrics["confusion_matrix"])
    print(f"\nSaved model:   {MODEL_PATH}")
    print(f"Saved metrics: {METRICS_PATH}")


if __name__ == "__main__":
    main()
