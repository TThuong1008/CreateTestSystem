import os
import json
import requests
from typing import List, Dict, Any
from config.config import Config
import logging
import traceback
import re

class MistralAIModel:
    def __init__(self):
        # Validate API key
        Config.validate_api_key()
        
        self.api_key = Config.MISTRAL_API_KEY
        self.base_url = "https://api.mistral.ai/v1/chat/completions"
        
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)
        
        # Only add handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def generate_questions(self, context: str, num_questions: int = 20) -> List[Dict]:
        """
        Generate exam questions using Mistral AI REST API
        
        Args:
            context (str): Input text for generating questions
            num_questions (int): Number of questions to generate
        
        Returns:
            List[Dict]: Generated exam questions
        """
        try:
            # Prepare prompt for question generation with a wrapper object format
            prompt = f"""
            Generate EXACTLY {num_questions} multiple-choice exam questions for an IT course.
            
            Return your response in this EXACT JSON format:
            {{
                "questions": [
                    {{
                        "question": "Precise technical question about IT topic",
                        "options": [
                            {{"text": "Option A", "is_correct": false}},
                            {{"text": "Option B", "is_correct": false}},
                            {{"text": "Option C", "is_correct": true}},
                            {{"text": "Option D", "is_correct": false}}
                        ]
                    }},
                    ... more questions ...
                ]
            }}

            Context to consider:
            {context}
            
            IMPORTANT RULES: 
            1. The response MUST be a valid JSON object with a 'questions' array
            2. You MUST generate EXACTLY {num_questions} questions, no more, no less
            3. Each question must have exactly 4 options
            4. Each question must have exactly 1 correct option
            5. Each question must be unique
            6. Cover various aspects of IT topics
            7. Maintain high quality and technical accuracy
            """
            
            # Prepare API request payload
            payload = {
                "model": "mistral-large-latest",
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are an expert exam question generator for IT and computer science topics. You MUST output valid JSON only."
                    },
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 4000,
                "temperature": 0.5,
                "response_format": {"type": "json_object"}
            }
            
            # Make API request
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = requests.post(
                self.base_url, 
                headers=headers, 
                data=json.dumps(payload),
                timeout=60  # Add timeout
            )
            
            # Check response
            response.raise_for_status()
            
            # Parse response
            response_data = response.json()
            
            # Extract content
            content = response_data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            # Debug logging
            self.logger.debug(f"Raw API Response Content: {content[:500]}...")  # Log first 500 chars
            
            # Attempt to fix potential JSON issues
            cleaned_content = self._sanitize_json(content)
            
            # Parse JSON
            try:
                parsed_json = json.loads(cleaned_content)
                
                # Extract questions array from wrapper object
                if isinstance(parsed_json, dict) and 'questions' in parsed_json:
                    questions = parsed_json['questions']
                elif isinstance(parsed_json, list):
                    questions = parsed_json
                else:
                    raise ValueError("Invalid response structure. Expected 'questions' array or direct question list.")
                
                # Validate question structure
                self._validate_questions(questions, num_questions)
                
                self.logger.info(f"Successfully generated {len(questions)} exam questions")
                return questions
            
            except json.JSONDecodeError as json_err:
                self.logger.error(f"JSON Decode Error: {json_err}")
                self.logger.error(f"Problematic Content: {cleaned_content[:1000]}...")  # Log first 1000 chars
                raise
            except ValueError as val_err:
                self.logger.error(f"Validation Error: {val_err}")
                raise
        
        except Exception as e:
            self.logger.error(f"Error generating questions: {e}")
            self.logger.error(traceback.format_exc())
            raise
    
    def _sanitize_json(self, content: str) -> str:
        """
        Attempt to clean and repair malformed JSON
        
        Args:
            content (str): Raw JSON string
            
        Returns:
            str: Cleaned JSON string
        """
        # Remove any leading/trailing non-JSON content
        content = content.strip()
        
        # Find JSON object boundaries (start with { and end with })
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, content, re.DOTALL)
        if match:
            content = match.group(1)
        
        # Replace any invalid control characters
        content = re.sub(r'[\x00-\x1F\x7F]', '', content)
        
        # Handle trailing commas in arrays/objects (common JSON error)
        content = re.sub(r',\s*([}\]])', r'\1', content)
        
        return content
    
    def _validate_questions(self, questions: List[Dict], expected_count: int) -> None:
        """
        Validate the structure and content of generated questions
        
        Args:
            questions (List[Dict]): List of question dictionaries
            expected_count (int): Expected number of questions
            
        Raises:
            ValueError: If validation fails
        """
        if not isinstance(questions, list):
            raise ValueError("Questions must be a list")
        
        if len(questions) < 1:
            raise ValueError("No questions were generated")
        
        if len(questions) != expected_count:
            self.logger.warning(f"Generated {len(questions)} questions instead of {expected_count}")
        
        for i, q in enumerate(questions):
            if not isinstance(q, dict):
                raise ValueError(f"Question {i+1} is not a dictionary")
            
            if 'question' not in q:
                raise ValueError(f"Question {i+1} is missing 'question' field")
            
            if 'options' not in q:
                raise ValueError(f"Question {i+1} is missing 'options' field")
            
            options = q['options']
            if not isinstance(options, list) or len(options) < 2:
                raise ValueError(f"Question {i+1} has invalid options")
            
            # Check for correct answer
            correct_count = sum(1 for opt in options if opt.get('is_correct'))
            if correct_count != 1:
                self.logger.warning(f"Question {i+1} has {correct_count} correct answers instead of 1")
                # Fix by making the first option correct if no correct answers
                if correct_count == 0 and len(options) > 0:
                    options[0]['is_correct'] = True
    
    def _fallback_generate_questions(self, context: str, num_questions: int = 10) -> List[Dict]:
        """
        Fallback method to generate questions if API fails
        
        Args:
            context (str): Input text for generating questions
            num_questions (int): Number of questions to generate
        
        Returns:
            List[Dict]: Generated exam questions
        """
        self.logger.info("Using fallback question generation method")
        
        # Predefined questions as a fallback
        default_questions = [
            {
                "question": "What is the primary purpose of machine learning?",
                "options": [
                    {"text": "To replace human intelligence", "is_correct": False},
                    {"text": "To enable computers to learn from data", "is_correct": True},
                    {"text": "To create complex mathematical models", "is_correct": False},
                    {"text": "To design new programming languages", "is_correct": False}
                ]
            },
            {
                "question": "What does API stand for?",
                "options": [
                    {"text": "Advanced Programming Interface", "is_correct": False},
                    {"text": "Application Programming Interface", "is_correct": True},
                    {"text": "Automated Programming Integration", "is_correct": False},
                    {"text": "Advanced Protocol Interface", "is_correct": False}
                ]
            },
            # Add more fallback questions here for better coverage
            {
                "question": "Which protocol is primarily used for secure communication over a computer network?",
                "options": [
                    {"text": "HTTP", "is_correct": False},
                    {"text": "FTP", "is_correct": False},
                    {"text": "HTTPS", "is_correct": True},
                    {"text": "SMTP", "is_correct": False}
                ]
            },
            {
                "question": "What is the function of DNS in a network?",
                "options": [
                    {"text": "To assign IP addresses", "is_correct": False},
                    {"text": "To translate domain names to IP addresses", "is_correct": True},
                    {"text": "To encrypt network traffic", "is_correct": False},
                    {"text": "To monitor network performance", "is_correct": False}
                ]
            },
            {
                "question": "Which of the following is NOT a programming paradigm?",
                "options": [
                    {"text": "Object-Oriented Programming", "is_correct": False},
                    {"text": "Functional Programming", "is_correct": False},
                    {"text": "Interpretative Programming", "is_correct": True},
                    {"text": "Procedural Programming", "is_correct": False}
                ]
            }
        ]
        
        # Return only the requested number of questions
        return default_questions[:min(len(default_questions), num_questions)]