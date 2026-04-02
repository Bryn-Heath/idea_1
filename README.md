# Job Form Autofill Assistant 🚀

Chrome extension + Python backend to **auto-fill job applications** from your `cv.pdf` using local LLM to summarize answers.

## ✅ Features Complete

- ✅ Scans forms, extracts labels/fields
- ✅ Parses cv.pdf, generates **personalized answers**
- ✅ Auto-fills answers
- ✅ Preview/edit/copy in popup
- ✅ 100% local (Ollama)

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
- Visit job form → Click icon → Scan → Fill!

## Backend API (http://localhost:5000/docs)

- `GET /health` - Status
- `POST /analyze` - Form → Answers

## Structure

```
├── cv.pdf           # Add your resume!
├── backend/         # FastAPI + Ollama
├── chrome-extension/ # Manifest v3 + popup
├── TODO.md          # [All complete]
```

## Test

1. Backend running + cv.pdf present
2. Load extension
3. Test on example HTML or real site
4. `curl -X POST http://localhost:5000/health`

## Production Notes

- Cloud LLM: set OPENAI_API_KEY in .env

**Fully functional!** Place cv.pdf, run backend, load extension, test on forms.

`command: uvicorn backend.app:app --host 0.0.0.0 --port 5000 --reload`

<!-- https://jobs.ashbyhq.com/vidrush/2d9ed37c-4e9d-4399-a88a-51ee5ac38328/application?utm_source=XE0R1M4b13 -->
