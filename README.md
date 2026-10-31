# MailShield AI

**MailShield AI** is a full-stack email analysis platform that combines
a machine-learning classifier with generative AI tools. It helps users
classify email text as spam or legitimate (ham), inspect potential
security concerns, generate professional emails, and improve existing
drafts.

The project is organized as three services:

-   **Web client:** Next.js application for the user interface.
-   **API server:** NestJS backend that exposes the public API and
    coordinates requests.
-   **ML service:** FastAPI service that serves the trained scikit-learn
    spam-classification model.

NestJS is the only backend service the browser communicates with. It
calls the internal FastAPI service for classification and the Groq API
for generative-AI features.

> **Important:** The classifier is a text-based spam classifier, not a
> complete email security gateway. It does not independently verify
> sender identity, SPF/DKIM/DMARC, URLs, attachments, or domain
> reputation.

------------------------------------------------------------------------

## Contents

-   [Features](#features)
-   [Architecture](#architecture)
-   [Technology stack](#technology-stack)
-   [Repository structure](#repository-structure)
-   [Prerequisites](#prerequisites)
-   [Environment configuration](#environment-configuration)
-   [Run locally](#run-locally)
-   [API reference](#api-reference)
-   [Machine-learning pipeline](#machine-learning-pipeline)
-   [Analytics and privacy](#analytics-and-privacy)
-   [Testing and verification](#testing-and-verification)
-   [Troubleshooting](#troubleshooting)
-   [Limitations and responsible use](#limitations-and-responsible-use)

------------------------------------------------------------------------

## Features

### Email analysis

-   Classifies submitted email text as `spam` or `ham`.
-   Returns spam and ham probabilities, inference duration, and model
    version.
-   Supports individual and batch analysis.
-   Batch analysis accepts up to 20 email texts per request.

### AI writing tools

-   **Generate:** drafts an email from a prompt, with tone and length
    options.
-   **Improve:** rewrites supplied text to improve clarity and
    presentation.
-   **Security scan:** produces an AI-generated explanation of potential
    security concerns in the supplied email text.

### Dashboard and analytics

-   Displays aggregate analysis counts and average inference duration.
-   Shows recent analysis metadata.
-   Stores analysis metadata rather than raw email bodies by default.

### User interface

The web application includes these routes:

  Route          Purpose
  -------------- ------------------------------
  `/`            Redirects to the dashboard
  `/dashboard`   Overview and analytics
  `/analyze`     Analyze one email
  `/batch`       Analyze multiple emails
  `/generate`    Generate an email
  `/improve`     Improve an email draft
  `/security`    Run an AI security scan
  `/history`     View recent analysis records
  `/settings`    Application settings

------------------------------------------------------------------------

## Architecture

``` text
                         Browser
                            |
                            | HTTP
                            v
                   Next.js Web Client
                            |
                            | Public API requests
                            v
                     NestJS API Server
                       /          \
                      /            \
             Classification       AI writing,
                request           improvement,
                  |              security scan
                  v                   |
             FastAPI ML               v
                Service           Groq API
                  |
                  v
          scikit-learn Model

                     NestJS API
                         |
                         v
                      MongoDB
               (analytics metadata)
```

### Request flow

1.  The user submits email text through the Next.js interface.
2.  The browser sends the request to the NestJS API.
3.  NestJS validates the request and calls FastAPI for ML
    classification.
4.  FastAPI runs inference using the model loaded in memory.
5.  NestJS returns the result to the browser and records permitted
    analytics metadata.
6.  For generation, improvement, and AI security explanations, NestJS
    calls Groq and returns the generated result.

**Service boundary:** FastAPI is an internal service. Do not expose it
directly to the public browser in this architecture.

------------------------------------------------------------------------

## Technology stack

  Layer               Technologies
  ------------------- -------------------------------------------
  Frontend            Next.js, React, TypeScript, Tailwind CSS
  UI and rendering    Lucide React, React Markdown, Remark GFM
  Backend API         NestJS, TypeScript
  ML API              Python, FastAPI, Pydantic
  Machine learning    scikit-learn, TF-IDF, Logistic Regression
  Generative AI       Groq API
  Database            MongoDB
  Model persistence   Joblib

------------------------------------------------------------------------

## Repository structure

The repository is intended to be organized as a monorepo:

``` text
mailshield-ai/
├── apps/
│   ├── web/                  # Next.js frontend
│   ├── server/               # NestJS public API
│   └── ml-service/           # FastAPI model-serving service
├── README.md
└── .gitignore
```

Typical service-level structure:

``` text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── src/
│   │   ├── email/
│   │   ├── analytics/
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
│
└── ml-service/
    ├── app/
    ├── training/
    ├── models/
    ├── requirements.txt
    └── .env.example
```

The exact internal filenames can differ between generated starter
packages and your local implementation. Keep the service
responsibilities and API contracts aligned when integrating them.

------------------------------------------------------------------------

## Prerequisites

Install the following before running the project:

-   Node.js (use a version supported by the installed Next.js and NestJS
    packages).
-   npm.
-   Python 3.10 or newer (confirm compatibility with the ML service
    dependencies).
-   MongoDB, either local or MongoDB Atlas.
-   A Groq API key for the generative-AI endpoints.

You can verify your installed tools:

``` bash
node --version
npm --version
python --version
```

------------------------------------------------------------------------

## Environment configuration

Create the environment files in each service using its `.env.example` as
the source of truth. Do not commit real credentials.

### Web client --- `apps/web/.env.local`

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`NEXT_PUBLIC_API_URL` is the NestJS base URL. The frontend API client
appends `/api/v1`, so do not add `/api/v1` to this value unless you also
change the API client.

### NestJS API --- `apps/server/.env`

Configure the values expected by your NestJS implementation. The
following names describe the required configuration; match them to the
actual keys in your `.env.example`:

``` env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/mailshield
ML_SERVICE_URL=http://127.0.0.1:8000
GROQ_API_KEY=your_groq_api_key
```

If your server uses a different MongoDB variable name, use the name
defined in its configuration code.

### FastAPI ML service --- `apps/ml-service/.env`

Configure the model artifact path and any service settings required by
your ML implementation. The trained model must exist at the path
expected by the FastAPI startup code.

Do not expose internal service credentials or the ML service itself
through `NEXT_PUBLIC_*` variables.

------------------------------------------------------------------------

## Run locally

Start each service in a separate terminal.

### 1. Start MongoDB

Start your local MongoDB service, or configure `MONGODB_URI` to point to
your MongoDB Atlas deployment.

### 2. Start the ML service

Open a terminal:

``` bash
cd apps/ml-service

python -m venv .venv
```

Activate the environment.

**Windows PowerShell:**

``` powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

``` bash
source .venv/bin/activate
```

Install dependencies and start FastAPI:

``` bash
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The import path `app.main:app` must match the actual FastAPI module and
application variable in your repository. If your entry point differs,
use that path instead.

When available, check the service's health endpoint and interactive API
documentation:

-   `http://127.0.0.1:8000/health` (if implemented)
-   `http://127.0.0.1:8000/docs`

### 3. Start the NestJS API

Open another terminal:

``` bash
cd apps/server
npm install
npm run start:dev
```

The API should be available at:

``` text
http://localhost:4000
```

The global API prefix is configured as `/api/v1`.

### 4. Start the Next.js web client

Open another terminal:

``` bash
cd apps/web
npm install
```

Create `.env.local` and set:

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Then run:

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## API reference

The public API is served by NestJS. The routes below use the `/api/v1`
prefix.

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  `POST`                  `/api/v1/email/analyze`         Analyze one email

  `POST`                  `/api/v1/email/batch-analyze`   Analyze multiple emails

  `POST`                  `/api/v1/email/generate`        Generate an email

  `POST`                  `/api/v1/email/improve`         Improve an email draft

  `POST`                  `/api/v1/email/security-scan`   Generate a security
                                                          analysis

  `GET`                   `/api/v1/analytics/overview`    Retrieve aggregate
                                                          analytics

  `GET`                   `/api/v1/analytics/recent`      Retrieve recent
                                                          analysis metadata
  -------------------------------------------------------------------------------

### Analyze one email

Request:

``` http
POST /api/v1/email/analyze
Content-Type: application/json
```

``` json
{
  "text": "Congratulations! You have won a prize. Claim it now."
}
```

The response includes the predicted label, class probabilities,
inference duration, and model version. A representative response shape
is:

``` json
{
  "label": "spam",
  "spam_probability": 0.98,
  "ham_probability": 0.02,
  "duration_ms": 12.5,
  "model_version": "..."
}
```

The probability values and duration above are illustrative, not a
guaranteed prediction.

### Batch analysis

Request:

``` http
POST /api/v1/email/batch-analyze
Content-Type: application/json
```

``` json
{
  "emails": [
    "Congratulations! Claim your prize now.",
    "Hi, the project meeting is scheduled for 10 AM tomorrow."
  ]
}
```

The endpoint accepts up to 20 email strings. The response contains the
total count and an individual result for each email.

### Generate an email

Request:

``` json
{
  "prompt": "Ask my professor for an extension on the assignment",
  "tone": "professional",
  "length": "medium"
}
```

Representative response:

``` json
{
  "content": "Generated email content..."
}
```

### Improve an email

Request:

``` json
{
  "text": "hey sir i need more time for assignment"
}
```

Representative response:

``` json
{
  "content": "Improved email content..."
}
```

### Security scan

Request:

``` json
{
  "text": "Your account will be closed. Click this link immediately..."
}
```

Representative response:

``` json
{
  "report": "Security analysis..."
}
```

The security scan is an AI-generated text assessment. It is not a
substitute for URL reputation checks, malware scanning, authentication
checks, or a security gateway.

### Analytics

-   `GET /api/v1/analytics/overview` returns aggregate counts and
    average analysis duration.
-   `GET /api/v1/analytics/recent` returns recent analysis metadata.

Use the DTOs and response types in your actual NestJS implementation as
the final contract. The examples in this README describe the intended
interface and should be updated if your implementation differs.

------------------------------------------------------------------------

## Machine-learning pipeline

### Training

The classifier uses a text-processing and classification pipeline:

1.  Load and validate the labeled email dataset.
2.  Split the dataset into training and test sets.
3.  Convert email text into numerical features using TF-IDF.
4.  Train a Logistic Regression classifier.
5.  Evaluate the classifier on the held-out test set.
6.  Save the fitted pipeline/model artifact and evaluation metrics.

The current training setup uses word-level and character-level TF-IDF
features with Logistic Regression.

### Dataset and reported evaluation

The development dataset previously used contains 5,171 email examples:

-   3,672 ham examples.
-   1,499 spam examples.

The previously reported random holdout evaluation was:

  Metric             Reported result
  ---------------- -----------------
  Accuracy                    99.23%
  Spam precision              98.03%
  Spam recall                 99.33%
  Spam F1-score               98.68%
  ROC AUC                     0.9997

These are results from the specific historical dataset and split used
during development. They are not a guarantee of real-world performance.
Duplicate or template-like messages can inflate random-split scores, and
historical Enron email data may not represent modern spam or phishing.

### Serving and retraining

-   FastAPI loads the trained model once when the service starts.
-   Prediction requests reuse the in-memory model; they do not retrain
    it.
-   Retraining is an explicit training operation, not something
    performed on every API request or server restart.
-   After producing a new model artifact, deploy it deliberately and
    restart/reload the ML service according to your deployment process.

Run the training script from the ML service directory if your project
uses the previously supplied training layout:

``` bash
python training/train.py
```

Confirm the script's expected dataset path and output artifact path
before running it. Keep the training dataset and generated model
artifacts out of public web directories.

------------------------------------------------------------------------

## Analytics and privacy

The intended default behavior is to store analysis metadata, not raw
email content.

Metadata may include:

-   Predicted label.
-   Spam and ham probabilities.
-   Inference duration.
-   Model version.
-   Analysis timestamp.

Avoid persisting email bodies unless there is a clear product
requirement and users are informed. Email content can contain personal,
confidential, or business-sensitive information.

For production deployment:

-   Use HTTPS.
-   Keep Groq and database credentials on the server.
-   Validate request sizes and input types.
-   Add rate limiting to public endpoints.
-   Restrict access to internal ML service endpoints.
-   Configure CORS for trusted frontend origins only.
-   Avoid logging raw email content, API keys, or other secrets.
-   Define retention and deletion policies for analytics metadata.

------------------------------------------------------------------------

## Testing and verification

Run the checks available in each service.

### Frontend

``` bash
cd apps/web
npm run build
```

### NestJS

``` bash
cd apps/server
npm run build
```

Run the test scripts defined in the package:

``` bash
npm test
```

### FastAPI

If the project includes automated tests:

``` bash
pytest
```

### Manual integration checklist

-   [ ] MongoDB is reachable from NestJS.
-   [ ] FastAPI starts and loads the expected model artifact.
-   [ ] NestJS can reach the ML service URL.
-   [ ] NestJS can reach Groq using the configured API key.
-   [ ] The web client can reach NestJS.
-   [ ] Single-email analysis returns a classification.
-   [ ] Batch analysis rejects more than 20 items.
-   [ ] Generate, improve, and security-scan endpoints return the
    expected response shape.
-   [ ] Analytics endpoints return metadata without exposing stored
    email bodies.

------------------------------------------------------------------------

## Troubleshooting

### Frontend cannot reach the API

-   Confirm NestJS is running.
-   Confirm `NEXT_PUBLIC_API_URL` points to the NestJS base URL.
-   Check that the frontend appends `/api/v1` exactly once.
-   Check NestJS CORS configuration and browser network errors.

### NestJS cannot reach FastAPI

-   Confirm FastAPI is running on the configured host and port.
-   Confirm `ML_SERVICE_URL` matches the NestJS runtime environment.
-   If using Docker Compose, do not use `localhost` to reach another
    container. Use the Compose service name and the container's
    listening port.

### FastAPI cannot load the model

-   Confirm training has produced the model artifact.
-   Confirm the configured artifact path is correct relative to the
    process working directory.
-   Confirm the Python environment has compatible scikit-learn and
    joblib versions.
-   Check the startup traceback for the exact missing file or
    dependency.

### Groq requests fail

-   Confirm `GROQ_API_KEY` is set in the NestJS environment.
-   Check provider quota, model availability, network access, and
    provider error responses.
-   Do not put the key in a `NEXT_PUBLIC_*` variable or frontend source
    code.

### MongoDB connection fails

-   Confirm the database process or Atlas cluster is available.
-   Verify `MONGODB_URI`, network access rules, and credentials.
-   If using Docker Compose, use the MongoDB service name rather than
    `localhost` from inside another container.

------------------------------------------------------------------------

## Limitations and responsible use

-   The ML model classifies text; it does not establish whether the
    sender is authentic.
-   A high spam probability is a model estimate, not proof that a
    message is malicious.
-   A ham prediction does not prove that an email is safe.
-   The generative-AI security report can be incomplete or incorrect.
-   Do not automatically delete, block, or quarantine important emails
    solely from this model's output.
-   Evaluate the model on representative, recent data before relying on
    it in production.
-   Consider adding independent checks for sender authentication, URL
    reputation, attachment analysis, domain age/reputation, and phishing
    indicators for a more complete security product.

------------------------------------------------------------------------

## License

Add the license that applies to your repository before publishing or
distributing the project.
