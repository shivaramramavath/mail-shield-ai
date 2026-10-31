from pathlib import Path
from contextlib import asynccontextmanager
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL = Path(__file__).resolve().parents[1] / 'models' / 'spam_pipeline.joblib'
state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not MODEL.exists():
        raise RuntimeError('Model missing; run python training/train.py first')
    # Only load artifacts produced by trusted training code: joblib uses pickle.
    state['model'] = joblib.load(MODEL)
    yield
    state.clear()

app = FastAPI(title='MailShield ML', lifespan=lifespan)

class Email(BaseModel):
    text: str = Field(min_length=1, max_length=20000)

class Batch(BaseModel):
    emails: list[Email] = Field(min_length=1, max_length=100)

def predict(text: str):
    model = state['model']
    probs = model.predict_proba([text])[0]
    values = dict(zip(model.classes_, map(float, probs)))
    spam = values.get('spam', 0.0)
    return {'label': 'spam' if spam >= 0.5 else 'ham', 'spamProbability': round(spam, 5),
            'hamProbability': round(1 - spam, 5), 'modelVersion': 'tfidf-logreg-demo-v1'}

@app.get('/ml/health')
def health():
    return {'ok': True, 'modelLoaded': 'model' in state}

@app.get('/ml/model/info')
def info():
    return {'version': 'tfidf-logreg-demo-v1', 'warning': 'Demonstration model, not production validated'}

@app.post('/ml/predict')
def classify(email: Email):
    return predict(email.text)

@app.post('/ml/predict/batch')
def batch_classify(batch: Batch):
    return {'results': [predict(email.text) for email in batch.emails]}
