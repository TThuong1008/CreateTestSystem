import streamlit as st
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel
import os
import tempfile
import traceback
from config.config import Config
from services.pdf_extractor import PDFExtractor
from models.mistral_model import MistralAIModel
from fpdf import FPDF  # Đảm bảo dùng fpdf2
import io
from fpdf.enums import XPos, YPos
import textwrap
from typing import List
def save_questions_to_pdf(questions):
    """Chuyển danh sách câu hỏi thành file PDF với hỗ trợ Unicode"""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Cấu hình font chữ
    pdf.add_font("DejaVu", "", "fonts/DejaVuSans.ttf", uni=True)
    pdf.add_font("DejaVu", "B", "fonts/DejaVuSans-Bold.ttf", uni=True)
    
    # Thiết lập thông số trang
    page_width = pdf.w - 2*pdf.l_margin  # Tính chiều rộng khả dụng
    font_size = 12
    pdf.set_font("DejaVu", "", font_size)
    
    # Tiêu đề
    pdf.set_font("DejaVu", "B", 16)
    pdf.cell(0, 10, "Exam Questions", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(10)

    # Hàm hỗ trợ wrap text
    def wrap_text(text, max_width_chars=60):
        return textwrap.fill(text, width=max_width_chars, break_long_words=True)

    for idx, q in enumerate(questions, 1):
        # Câu hỏi
        pdf.set_font("DejaVu", "B", font_size)
        question_text = wrap_text(f"Question {idx}: {q['question']}")
        pdf.multi_cell(page_width, 10, question_text)
        pdf.ln(5)
        
        # Phương án
        pdf.set_font("DejaVu", "", font_size)
        for i, opt in enumerate(q['options']):
            option_letter = chr(65 + i)
            correct_marker = "*" if opt['is_correct'] else ""
            full_text = f"{option_letter}. {opt['text']}{correct_marker}"
            
            # Xử lý wrap text với max 60 ký tự/line
            wrapped_text = wrap_text(full_text)
            
            # Tính toán chiều cao cần thiết
            text_width = pdf.get_string_width(wrapped_text)
            if text_width > page_width:
                wrapped_text = wrap_text(full_text, max_width_chars=40)
            
            pdf.multi_cell(page_width, 10, wrapped_text)
            pdf.ln(2)  # Giảm khoảng cách giữa các phương án
        
        pdf.ln(8)  # Khoảng cách giữa các câu hỏi

    buffer = io.BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    return buffer.getvalue()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Định nghĩa model cho option
class QuestionOption(BaseModel):
    text: str
    is_correct: bool

# Định nghĩa model cho câu hỏi
class Question(BaseModel):
    question: str
    options: List[QuestionOption]

# Định nghĩa model cho request
class PDFRequest(BaseModel):
    questions: List[Question]

@app.post("/api/generate-questions")
async def generate_questions(file: UploadFile = File(...), num_questions: int = 20):
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF allowed")

        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Process PDF
        pdf_extractor = PDFExtractor()
        extracted_text = pdf_extractor.extract_text(temp_path)
        
        # Generate questions
        mistral = MistralAIModel()
        questions = mistral.generate_questions(extracted_text, num_questions)
        
        # Cleanup
        os.unlink(temp_path)
        
        return JSONResponse(content={"questions": questions})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-pdf")
async def generate_pdf(request: PDFRequest):
    try:
        # Log dữ liệu nhận được để debug
        print("Received data:", request.dict())
        
        # Chuyển đổi sang dict
        questions = [q.dict() for q in request.questions]
        
        # Tạo PDF
        pdf_data = save_questions_to_pdf(questions)
        
        return StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=exam_questions.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))