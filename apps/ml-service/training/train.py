import csv
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'datasets' / 'spam.csv'
texts, labels = [], []
with source.open(encoding='utf-8-sig', newline='') as f:
    for row in csv.DictReader(f):
        label = row['label'].strip().lower()
        if label not in ('spam', 'ham'):
            raise ValueError('Expected label spam or ham')
        texts.append(row['text'])
        labels.append(label)
if len(texts) < 10 or len(set(labels)) != 2:
    raise ValueError('Provide at least 10 labeled rows from both classes')
model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=30000)),
    ('classifier', LogisticRegression(max_iter=1000, class_weight='balanced')),
])
model.fit(texts, labels)
output = ROOT / 'models' / 'spam_pipeline.joblib'
output.parent.mkdir(exist_ok=True)
joblib.dump(model, output)
print(f'Trained on {len(texts)} rows. Saved {output}')
print('WARNING: sample dataset is for smoke testing only; replace with real labeled data and evaluate holdout metrics.')
