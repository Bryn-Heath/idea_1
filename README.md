# Job Form Autofill Assistant 🚀

Chrome extension + Python backend to **auto-fill job applications** from your `cv.pdf` using local LLM to summarize answers.

## ✅ Features Complete

- ✅ Scans forms, extracts labels/fields
- ✅ Parses cv.pdf, generates **personalized answers**
- ✅ Auto-fills answers

## 🎯 Quick Start

```
cd c:/Users/itzbr/Desktop/idea_1
# 1. Add your CV
cp YOUR_CV.pdf cv.pdf

# 2. Backend
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
ollama pull llama3
uvicorn backend.app:app --host 0.0.0.0 --port 5000 --reload
```

# 3. Extension

- chrome://extensions/
- "Load unpacked" → `chrome-extension/`
- Visit job form → Click icon → Scan → Fill

## Backend API (http://localhost:5000/docs)

- `GET /health` - Status
- `POST /analyze` - Form → Answers

## Structure

```
├── cv.pdf           # Add your resume!
├── backend/         # FastAPI + Ollama
├── chrome-extension/ # Manifest v3 + popup
```

`command: uvicorn backend.app:app --host 0.0.0.0 --port 5000 --reload`

<!-- https://jobs.ashbyhq.com/vidrush/2d9ed37c-4e9d-4399-a88a-51ee5ac38328/application?utm_source=XE0R1M4b13 -->
