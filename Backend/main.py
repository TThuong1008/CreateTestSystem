import streamlit as st
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import json
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
import tempfile
import traceback
from config.config import Config
from services.document_extractor import DocumentExtractor
from models.mistral_model import MistralAIModel
from fpdf import FPDF  # Đảm bảo dùng fpdf2
import io
from fpdf.enums import XPos, YPos
import textwrap
from typing import List
import jwt
from datetime import datetime, timedelta
from database.user_model import User, UserCreate, UserLogin, UserInDB
from database.database import *
from database.models import *
import bcrypt
from dotenv import load_dotenv

# Token creation function
load_dotenv()

# Lấy SECRET_KEY từ biến môi trường
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in environment variables.")

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Token creation function
def create_access_token(data: dict, expires_delta: int = 3600):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

# When creating a hash
def hash_password(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # Store as string

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        # Find user in database
        user = await users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
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

@app.post("/signup")
async def signup(user: UserCreate):
    # Kiểm tra email đã tồn tại
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Mã hóa mật khẩu và lưu người dùng vào DB
    hashed_password = hash_password(user.password)
    user_in_db = UserInDB(**user.dict(), hashed_password=hashed_password, created_at=datetime.utcnow())

    # Lưu người dùng vào MongoDB
    await users.insert_one(user_in_db.dict())

    # Trả về thông báo thành công
    return {"msg": "Registration successful"}


# User login endpoint with JWT token generation
@app.post("/login")
async def login(user: UserLogin):
    # Kiểm tra email trong DB
    existing_user = await users.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Kiểm tra mật khẩu
    if not verify_password(user.password, existing_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Tạo và trả về JWT token
    token = create_access_token(data={"sub": existing_user["email"], "name": existing_user["username"]}, expires_delta=3600)
    
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/generate-questions")
async def generate_questions(file: UploadFile = File(...), num_questions: int = 20):
    try:
        # Get file extension
        filename = file.filename
        _, file_extension = os.path.splitext(filename)
        file_extension = file_extension.lower()
        
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.pptx']
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Supported formats: {', '.join(allowed_extensions)}"
            )

        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Process document
        document_extractor = DocumentExtractor()  # Use the new DocumentExtractor
        extracted_text = document_extractor.extract_text(temp_path)
        
        # Generate questions
        mistral = MistralAIModel()
        questions = mistral.generate_questions(extracted_text, num_questions)
        
        # Cleanup
        os.unlink(temp_path)
        
        return JSONResponse(content={"questions": questions})
    
    except Exception as e:
        logging.error(f"Error processing file: {str(e)}")
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

# Question Set CRUD
@app.post("/api/save_question")
async def create_question_set(data: dict, current_user: dict = Depends(get_current_user)):
    try:
        # Extract and validate the data
        set_name = data.get("set_name")
        questions_data = data.get("questions", [])
        status = data.get("status", "private")  # Default to private if not specified

        if not set_name or not questions_data:
            raise HTTPException(status_code=400, detail="Invalid data: 'set_name' and 'questions' are required")
        
        # Use the authenticated user's ID
        user_id = current_user["_id"]

        # Create the QuestionSet document
        question_set = {
            "set_name": set_name,
            "created_by": user_id,  
            "status": status,  # Set the status (private or public)
            "created_at": datetime.utcnow()
        }
        
        result = await question_sets.insert_one(question_set)
        set_id = result.inserted_id

        # Create questions and answers (rest of the function remains the same)
        questions_to_insert = []
        for i, q in enumerate(questions_data):
            # Map frontend structure to database structure
            question_text = q.get("question")
            options = q.get("options", [])

            if not question_text or not options:
                raise HTTPException(status_code=400, detail="Invalid question structure")

            # Create answers array with ObjectIds
            answers = []
            correct_answer_id = None
            
            for opt in options:
                answer_id = ObjectId()
                answer = {
                    "_id": answer_id,
                    "answer_text": opt["text"]
                }
                answers.append(answer)
                
                # Track the correct answer
                if opt.get("is_correct"):
                    correct_answer_id = answer_id

            if not correct_answer_id:
                raise HTTPException(status_code=400, detail=f"No correct answer found for question {i+1}")

            # Create the question document
            question = {
                "question_text": question_text,
                "answers": answers,
                "correct": correct_answer_id,
                "set_id": set_id
            }
            questions_to_insert.append(question)

        # Insert all questions into the database
        if questions_to_insert:
            print(f"Inserting {len(questions_to_insert)} questions")
            insert_result = await questions.insert_many(questions_to_insert)
            print(f"Inserted question IDs: {insert_result.inserted_ids}")
        else:
            print("No questions to insert")

        return {"message": "Lưu bộ câu hỏi thành công", "set_id": str(set_id)}

    except Exception as e:
        print(f"Error in save_question: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/api/question-sets")
async def get_question_sets(current_user: Optional[dict] = Depends(get_current_user), include_public: bool = True):
    try:
        # Build the query filter
        filter_query = {}
        
        if current_user:
            # If user is authenticated, get their private sets
            user_id = current_user["_id"]
            filter_query = {
                "$or": [
                    {"created_by": user_id},  # User's own sets
                ]
            }
            
            # Include public sets from other users if requested
            if include_public:
                filter_query["$or"].append({"status": "public"})
        else:
            # If no user_id, only return public sets
            filter_query = {"status": "public"}
            
        # Fetch question sets from the database
        cursor = question_sets.find(filter_query).sort("created_at", -1)  # Sort by created_at descending
        
        # Convert to list and format for response
        result = []
        async for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            doc["created_by"] = str(doc["created_by"])
            result.append(doc)
            
        return result
        
    except Exception as e:
        print(f"Error retrieving question sets: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.put("/api/question-sets/{set_id}/toggle-status")
async def toggle_question_set_status(set_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Kiểm tra set_id có phải ObjectId hợp lệ
        if not ObjectId.is_valid(set_id):
            raise HTTPException(status_code=400, detail="Invalid set_id format")

        user_id = current_user["_id"]
        # Find the question set

        question_set = await question_sets.find_one({"_id": ObjectId(set_id)})
        if not question_set:
            raise HTTPException(status_code=404, detail=f"Question set with ID {set_id} not found")
            
        # Check if the user is the owner
        if question_set["created_by"] != ObjectId(user_id):
            raise HTTPException(status_code=403, detail="You don't have permission to modify this question set")
            
        # Toggle the status
        new_status = "public" if question_set.get("status") == "private" else "private"
        
        # Update the question set
        result = await question_sets.update_one(
            {"_id": ObjectId(set_id)},
            {"$set": {"status": new_status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update question set status")
            
        return {"message": f"Question set status updated to {new_status}", "status": new_status}
        
    except Exception as e:
        print(f"Error toggling question set status: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/api/question-details/{set_id}")
async def get_question_details(set_id: str):
    try:
        # Fetch the question set
        question_set = await question_sets.find_one({"_id": ObjectId(set_id)})
        
        if not question_set:
            raise HTTPException(status_code=404, detail="Question set not found")
            
        # Fetch the questions associated with this set
        questions_list = await questions.find({"set_id": ObjectId(set_id)}).to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization in the question set
        question_set["_id"] = str(question_set["_id"])
        question_set["created_by"] = str(question_set["created_by"])
        
        # Convert ObjectId to string for JSON serialization in questions
        for q in questions_list:
            q["_id"] = str(q["_id"])
            q["correct"] = str(q["correct"])
            q["set_id"] = str(q["set_id"])
            
            # Convert answers to string IDs
            for ans in q["answers"]:
                ans["_id"] = str(ans["_id"])
        
        return {"question_set": question_set, "questions": questions_list}
        
    except Exception as e:
        print(f"Error retrieving question details: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/api/submit-test/{set_id}")
async def submit_test(
    set_id: str,
    request: dict,  # Nhận cả answers và time_spent
    current_user: dict = Depends(get_current_user)
):
    try:
        # Lấy dữ liệu từ request
        answers = request.get("answers", [])
        time_spent = request.get("time_spent", 0)

        # Validate input
        if not ObjectId.is_valid(set_id):
            raise HTTPException(status_code=400, detail="Invalid set ID")
        
        # Lấy user id từ token đã xác thực
        user_id = current_user["_id"]

        # Tìm bộ câu hỏi
        question_set = await question_sets.find_one({"_id": ObjectId(set_id)})
        if not question_set:
            raise HTTPException(status_code=404, detail="Question set not found")

        # Lấy tất cả câu hỏi trong bộ
        questions_list = await questions.find({"set_id": ObjectId(set_id)}).to_list(None)
        question_map = {str(q["_id"]): q for q in questions_list}

        # Tính điểm
        correct_count = 0
        user_answers_to_insert = []

        # Tạo test history
        test_history_doc = {
            "user_id": user_id,
            "set_id": ObjectId(set_id),
            "sum_correct": 0,
            "time_spent": time_spent,
            "completed_at": datetime.utcnow()
        }
        
        # Insert test history
        test_result = await db.test_history.insert_one(test_history_doc)
        test_id = test_result.inserted_id

        # Xử lý từng câu trả lời
        for answer in answers:
            question_id = answer.get("question_id")
            selected_answer_id = answer.get("answer_id")

            # Tìm câu hỏi và đáp án đúng
            question = question_map.get(question_id)
            if not question:
                continue

            is_correct = str(question["correct"]) == selected_answer_id
            if is_correct:
                correct_count += 1

            # Lưu user answer
            user_answer = {
                "test_id": test_id,
                "question_id": ObjectId(question_id),
                "is_correct": is_correct
            }
            user_answers_to_insert.append(user_answer)

        # Cập nhật tổng điểm
        await db.test_history.update_one(
            {"_id": test_id},
            {"$set": {"sum_correct": correct_count}}
        )

        # Chèn hàng loạt user answers
        if user_answers_to_insert:
            await db.user_answers.insert_many(user_answers_to_insert)

        return {
            "success": True,
            "score": correct_count,
            "total_questions": len(questions_list),
            "test_id": str(test_id)
        }

    except Exception as e:
        print(f"Error in submit_test: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-history")
async def get_test_history(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]
        # Lấy tất cả test history của người dùng
        history_cursor = db.test_history.find({"user_id": user_id}).sort("completed_at", -1)
        history = []
        
        # Lấy tất cả question sets để ánh xạ set_id với set_name
        question_sets = await db.question_sets.find().to_list(None)
        question_sets_map = {str(qs["_id"]): qs["set_name"] for qs in question_sets}
        
        # Lấy tất cả câu hỏi để ánh xạ question_id
        all_questions = await questions.find().to_list(None)
        question_map = {str(q["_id"]): q for q in all_questions}
        
        async for test in history_cursor:
            test_id = test["_id"]
            set_id = str(test["set_id"])
            
            # Lấy user_answers cho test này
            user_answers = await db.user_answers.find({"test_id": test_id}).to_list(None)
            detailed_answers = []
            
            for ua in user_answers:
                question = question_map.get(str(ua["question_id"]))
                if not question:
                    continue
                selected_answer = None
                if ua.get("selected_answer_id"):
                    selected_answer = next(
                        (ans for ans in question["answers"] if str(ans["_id"]) == str(ua["selected_answer_id"])),
                        None
                    )
                correct_answer = next(
                    (ans for ans in question["answers"] if str(ans["_id"]) == str(question["correct"])),
                    None
                )
                detailed_answers.append({
                    "question_id": str(ua["question_id"]),
                    "question_text": question["question_text"],
                    "selected_answer": selected_answer["answer_text"] if selected_answer else None,
                    "correct_answer": correct_answer["answer_text"] if correct_answer else None,
                    "is_correct": ua["is_correct"],
                    "answers": [
                        {"_id": str(ans["_id"]), "answer_text": ans["answer_text"]}
                        for ans in question["answers"]
                    ]
                })
            
            # Lấy số lượng câu hỏi trong bộ
            questions_list = [q for q in all_questions if str(q["set_id"]) == set_id]
            
            history.append({
                "test_id": str(test["_id"]),
                "set_id": set_id,
                "set_name": question_sets_map.get(set_id, "Unknown Set"),
                "sum_correct": test["sum_correct"],
                "total_questions": len(questions_list),
                "time_spent": test["time_spent"],
                "completed_at": test["completed_at"],
                "answers": detailed_answers
            })
        
        return {"history": history}
    except Exception as e:
        print(f"Error retrieving test history: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")