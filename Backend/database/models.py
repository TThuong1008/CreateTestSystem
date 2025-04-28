from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Any, Dict, List
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any, field: Optional[Any] = None) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        # Trả về schema JSON cho Pydantic v2, định nghĩa kiểu là string
        return {
            "type": "string",
            "format": "objectid",
            "title": "ObjectId"
        }

class QuestionSet(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    set_name: str
    created_by: PyObjectId
    status: Optional[str] = "private"  # private, public
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Answer(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    answer_text: str

class Question(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    question_text: str
    answers: List[Answer]
    correct: PyObjectId  # ID của answer đúng
    set_id: PyObjectId

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.now)

class TestHistory(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    set_id: PyObjectId
    sum_correct: int
    time_spent: int  # seconds
    completed_at: datetime = Field(default_factory=datetime.now)

class UserAnswer(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    test_id: PyObjectId
    question_id: PyObjectId
    is_correct: bool