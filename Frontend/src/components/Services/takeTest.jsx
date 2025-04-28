import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TestContent = ({ isTestStarted, set_id }) => {
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [completedTests, setCompletedTests] = useState({});

  useEffect(() => {
    let timer;
    if (isTestStarted) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestStarted]);

  useEffect(() => {
    if (isTestStarted && set_id) {
      loadQuestions(set_id);
      if(completedTests[set_id]) {
        setScore(completedTests[set_id]);
      }else {
        setScore(null);
      }
      if(!completedTests[set_id]) {
        setTimeSpent(0);
      }
      }
  }, [isTestStarted, set_id, completedTests]);
  const loadQuestions = async (setId) => {
    setLoading(true);
    try {
      // Fetch questions for this set
      const response = await axios.get(`http://localhost:8000/api/question-details/${setId}`);
      setActiveQuestions(response.data.questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Error fetching questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    
    const formData = new FormData(e.target);
    const answers = activeQuestions.map((question, index) => {
      return {
        question_id: question._id,
        answer_id: formData.get(`question-${index}`) || ""
      };
    });
    
    // Kiểm tra xem có câu hỏi nào chưa được trả lời không
    const unansweredQuestions = answers.filter(answer => !answer.answer_id);
    
    if (unansweredQuestions.length > 0) {
      setValidationError(`Vui lòng trả lời tất cả câu hỏi. Còn ${unansweredQuestions.length} câu chưa trả lời.`);
      
      // Đánh dấu các câu hỏi chưa trả lời
      unansweredQuestions.forEach((_, index) => {
        const questionElement = document.getElementById(`question-${index}`);
        if (questionElement) {
          questionElement.classList.add('border-red-500');
          questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      return;
    }
    
    try {
      // Get token with the correct key name
      const token = localStorage.getItem('access_token');
    
      if (!token) {
        setError("You need to log in to submit your work.");
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/api/submit-test/${set_id}`,
        {
          answers: answers,
          time_spent: timeSpent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const testResult = {
          correct: response.data.score,
          total: response.data.total_questions,
          time: formatTime(timeSpent)
        };
        setScore(testResult);
        
        // Store this test result
        setCompletedTests(prev => ({
          ...prev,
          [set_id]: testResult
        }));
        }
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError("Error submitting answers.");
    }
  };

  // Hàm định dạng thời gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {isTestStarted ? (
        <motion.div
          className="bg-white shadow-lg rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-2xl font-bold mb-6">Test</h2>
          <div className="text-right mb-4">
            <span className="font-semibold">Time: {formatTime(timeSpent)}</span>
          </div>
          {loading ? (
            <p className="text-center">Loading questions...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <form onSubmit={handleFormSubmit}>
              {validationError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {validationError}
                </div>
              )}
              {activeQuestions.length > 0 ? (
                <div className="space-y-6">
                  {activeQuestions.map((question, index) => (
                     <div 
                     key={index} 
                     id={`question-${index}`}
                     className="border-b pb-6 transition-colors duration-300"
                   >
                      <h3 className="text-lg font-semibold mb-4">
                      Question {index + 1}: {question.question_text}
                      </h3>

                      <div className="space-y-2 ml-4">
                        {question.answers && question.answers.map((answer, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={answer._id}
                              className="w-4 h-4"
                              id={`answer-${index}-${i}`}
                            />
                            <label htmlFor={`answer-${index}-${i}`} className="text-gray-700">
                              {answer.answer_text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                  >
                    Submit Test
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  There are no questions in this test set yet.
                </p>
              )}
            </form>
          )}
        </motion.div>
      ) : (
        <p className="text-center text-gray-500">Select questions and press Start Test to begin.</p>
      )}
      {score && (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-xl font-bold text-green-600">Test results</h3>
        <p>Correct: {score.correct}/{score.total}</p>
        <p>Time: {score.time}</p>
        
      </div>

    )}
    </div>
    
  );
};

export default TestContent;