# MailShield AI — FastAPI ML Service

This service trains and serves a spam/ham classifier using the supplied `spam_ham_dataset.csv`.

## Dataset used

Expected location: `datasets/spam_ham_dataset.csv`

Required columns:
- `text`: email subject/body text used as model input.
- `label_num`: target (`0 = ham`, `1 = spam`).

The supplied dataset contains 5,171 records: 3,672 ham and 1,499 spam. The script ignores the extra index column, drops empty records, validates target values, and checks that `label` agrees with `label_num` when the text label column exists.

## Model

- Word TF-IDF: unigram + bigram features.
- Character TF-IDF: character n-grams (3–5) to help with misspellings and obfuscation.
- Logistic Regression classifier.
- Stratified 80/20 train/test split with a fixed random seed.
- Evaluation: accuracy, spam precision, spam recall, spam F1, ROC-AUC, confusion matrix, and classification report.

The saved artifact includes the fitted pipeline, model version, threshold, training timestamp, dataset row count, and evaluation metrics. The model is loaded once at FastAPI startup; requests do not retrain the model.

## Windows PowerShell setup

From `apps/ml-service`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python training/train.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

## Endpoints

- `GET /` — service information.
- `GET /health` — model readiness.
- `GET /model/info` — model version, threshold, and evaluation metrics.
- `POST /predict` — one email prediction.
- `POST /predict/batch` — up to 20 predictions.

### POST `/predict`

Request:
```json
{ "text": "Congratulations! You have won a free prize. Claim now." }
```

Response (field names match the NestJS `MlService`):
```json
{
  "label": "spam",
  "spam_probability": 0.987,
  "ham_probability": 0.013,
  "duration_ms": 3.5,
  "model_version": "mailshield-tfidf-logreg-v1"
}
```

### Test with PowerShell

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8000/predict" `
  -ContentType "application/json" `
  -Body '{"text":"Congratulations! You won a free prize. Claim now."}'
```

Swagger UI: http://localhost:8000/docs

## Retraining

After replacing the CSV with a newer validated dataset, run:
```powershell
python training/train.py
```
Restart FastAPI to load the new artifact. For production, train and evaluate in a separate deployment job, compare against the current model, and promote the artifact only after reviewing precision/recall and false positives. Do not retrain on every API startup or directly from unreviewed user feedback.

## Notes and limitations

- This is a baseline text classifier, not a complete phishing detector. It does not inspect actual sender authentication, DNS, URLs, attachments, or message headers.
- The dataset is historical Enron email data; performance on modern email traffic may differ. Evaluate on representative, recent, independently sourced data before production.
- A probability from Logistic Regression is a model score and should not be treated as a guaranteed calibrated real-world probability.
- Keep raw email text out of application logs and analytics by default.
- FastAPI should remain an internal service; expose NestJS to the browser, not this service directly.
