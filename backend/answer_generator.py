import ollama
import os
from typing import List
from .models import Answer, FormField
from .logging_config import get_logger

logger = get_logger(__name__)

MODEL = os.getenv("OLLAMA_MODEL", "llama3")

SYSTEM_PROMPT = (
    "You are a job application assistant. "
    "Given a candidate's CV and job form field, generate a concise, professional answer "
    "directly from the CV experience. Be specific, use real projects/achievements. "
    "For basic fields (name/email), use common sense or leave short. "
    "Length: 1-3 sentences max. High confidence if direct CV match. "
    "Format: Just the answer text. Do not include any preamble or introduction."
)

CV_TRUNCATE_LENGTH = 11000


def generate_answers(fields: List[FormField], cv_text: str) -> List[Answer]:
    answers = []

    type_here_fields = [
        f for f in fields
        if f.placeholder and "type here..." in f.placeholder.lower()
    ]

    logger.info(f"Generating answers for {len(type_here_fields)} 'type here' fields")

    for field in type_here_fields:
        if not cv_text:
            answers.append(Answer(
                field_id=field.id,
                label=field.label,
                suggested_answer="CV not available - please add cv.pdf",
                confidence=0.0,
            ))
            continue

        user_prompt = (
            f"CV: {cv_text[:CV_TRUNCATE_LENGTH]}...\n\n"
            f"Field: '{field.label}' (type: {field.input_type})\n"
            f"Required: {field.required}\n"
            f"Description: {field.description or 'N/A'}\n\n"
            f"Answer:"
        )

        try:
            response = ollama.chat(model=MODEL, messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ])
            answer = response["message"]["content"].strip()
            conf = 0.9
        except Exception as e:
            logger.error(f"LLM error for {field.label}: {e}")
            answer = f"Generated answer for {field.label}"
            conf = 0.3

        answers.append(Answer(
            field_id=field.id,
            label=field.label,
            suggested_answer=answer,
            confidence=conf,
        ))

    logger.info(f"Generated {len(answers)} answers")
    return answers
