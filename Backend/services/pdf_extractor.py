# services/pdf_extractor.py
import PyPDF2
import logging
from typing import List

class PDFExtractor:
    def __init__(self):
        # Fallback logging if custom setup fails
        try:
            from utils.logging_config import setup_logging
            self.logger = setup_logging(__name__)
        except ImportError:
            # Use standard logging if custom setup is unavailable
            self.logger = logging.getLogger(__name__)
            self.logger.setLevel(logging.INFO)
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from PDF file
        
        Args:
            file_path (str): Path to the PDF file
        
        Returns:
            str: Extracted text from the PDF
        """
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                full_text = ""
                
                # Extract text from all pages
                for page in reader.pages:
                    full_text += page.extract_text() + "\n"
                
                self.logger.info(f"Successfully extracted text from {file_path}")
                return full_text
        
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {e}")
            raise