import os
from pathlib import Path
from typing import Optional, Union
from PyPDF2 import PdfReader
from .logging_config import get_logger

logger = get_logger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_CV_PATH = BACKEND_DIR / "cv.pdf"


def load_cv_text(pdf_path: Optional[Union[str, Path]] = None) -> str:
    path = Path(pdf_path) if pdf_path else DEFAULT_CV_PATH

    if not path.exists():
        logger.warning(f"cv.pdf not found at {path}. Place your CV there.")
        return ""

    try:
        reader = PdfReader(str(path))
        text = "".join(page.extract_text() + "\n" for page in reader.pages)
        logger.info(f"CV loaded: {len(text)} chars")
        return text.strip()
    except Exception as e:
        logger.error(f"Error reading CV: {e}")
        return ""
