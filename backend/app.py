from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .logging_config import setup_logging, get_logger
from .models import AnalyzeRequest, AnalyzeResponse
from .cv_processor import load_cv_text
from .answer_generator import generate_answers

load_dotenv()
setup_logging()
logger = get_logger(__name__)

app = FastAPI(title="Form Autofill Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost:*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cv_text = load_cv_text()


@app.get("/health")
async def health():
    return {"status": "healthy", "cv_loaded": len(cv_text) > 0}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_form(request: AnalyzeRequest):
    logger.info(f"Received analyze request for {len(request.fields)} fields")
    try:
        answers = generate_answers(request.fields, cv_text)
        return AnalyzeResponse(answers=answers, summary="Answers generated from CV")
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVER_PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
