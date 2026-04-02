from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

class InputType(str, Enum):
    TEXT = "text"
    EMAIL = "email"
    URL = "url"
    TEL = "tel"
    TEXTAREA = "textarea"
    FILE = "file"
    SELECT = "select"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    NUMBER = "number"

class FormField(BaseModel):
    id: str
    name: Optional[str] = None
    label: str
    input_type: InputType
    placeholder: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    value: Optional[str] = None

class AnalyzeRequest(BaseModel):
    fields: List[FormField]
    url: Optional[str] = None

class Answer(BaseModel):
    field_id: str
    label: str
    suggested_answer: str
    confidence: float = 0.8  # LLM score

class AnalyzeResponse(BaseModel):
    answers: List[Answer]
    summary: str = "Ready to auto-fill"

