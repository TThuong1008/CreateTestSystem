from motor.motor_asyncio import AsyncIOMotorClient
from models import *

MONGO_URI = "mongodb+srv://coderTun:zvgOj0TkkUpdgVur@cluster0.kk9cr8h.mongodb.net/testSystem?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "testSystem"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Define collections
question_sets = db["question_sets"]
users = db["users"]
questions = db["questions"]
test_history = db["test_history"]
user_answers = db["user_answers"]
