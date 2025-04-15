# config/config.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Mistral AI Configuration
    MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
    
    # PDF Processing Settings
    ALLOWED_EXTENSIONS = ['.pdf']
    MAX_FILE_SIZE_MB = 50
    
    # Question Generation Settings
    NUM_QUESTIONS_PER_DOCUMENT = 10
    QUESTION_TYPES = ['multiple_choice']
    
    # Logging Configuration
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'exam_generator.log'
    
    # Validation methods
    @classmethod
    def validate_api_key(cls):
        if not cls.MISTRAL_API_KEY:
            raise ValueError("Mistral API Key is not set. Please check your .env file.")
        
    @classmethod
    def validate_file(cls, file_path):
        """Validate uploaded PDF file"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Check file extension
        file_ext = os.path.splitext(file_path)[1]
        if file_ext not in cls.ALLOWED_EXTENSIONS:
            raise ValueError(f"Invalid file type. Only {cls.ALLOWED_EXTENSIONS} are allowed.")
        
        # Check file size
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        if file_size_mb > cls.MAX_FILE_SIZE_MB:
            raise ValueError(f"File too large. Maximum size is {cls.MAX_FILE_SIZE_MB}MB.")