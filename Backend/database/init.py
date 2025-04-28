import asyncio
from database.database import *
from database.models import *
from bson import ObjectId
from datetime import datetime

async def insert_sample_data():
    # Xóa dữ liệu cũ
    # await question_sets.delete_many({})
    # await users.delete_many({})
    # await questions.delete_many({})
    # await test_history.delete_many({})
    # await user_answers.delete_many({})

    # Tạo user mẫu
    user = User(
        email="user@example.com",
        name="Nguyễn Văn A",
        hashed_password="123456"
    )
    user_result = await users.insert_one(user.dict(by_alias=True))
    user_id = user_result.inserted_id

    # Tạo bộ câu hỏi
    question_set = QuestionSet(
        set_name="Lập trình căn bản",
        created_by=user_id,
        created_at=datetime.utcnow()
    )
    set_result = await question_sets.insert_one(question_set.dict(by_alias=True))
    set_id = set_result.inserted_id

    # Tạo câu hỏi và câu trả lời
    answers = [
        Answer(answer_text="Python"),
        Answer(answer_text="Java"),
        Answer(answer_text="C++"),
        Answer(answer_text="JavaScript")
    ]
    
    question = Question(
        question_text="Ngôn ngữ nào được dùng trong Machine Learning?",
        answers=answers,
        correct=answers[0].id,  # Giả sử Python là đáp án đúng
        set_id=set_id
    )
    await questions.insert_one(question.dict(by_alias=True))

    # Tạo lịch sử test
    test = TestHistory(
        user_id=user_id,
        set_id=set_id,
        sum_correct=8,
        time_spent=1200
    )
    await test_history.insert_one(test.dict(by_alias=True))

    user_answer = UserAnswer(
        test_id=test_id,
        question_id=question_id,
        is_correct=True
    )
    await user_answers.insert_one(user_answer.dict(by_alias=True))


    print("✅ Dữ liệu mẫu đã được chèn thành công!")

if __name__ == "__main__":
    asyncio.run(insert_sample_data())