import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const TestHistory = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTests, setExpandedTests] = useState({});

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError("You need to log in to view test history");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:8000/api/test-history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setTestHistory(response.data.history);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching test history:", err);
        setError("Error fetching test history.");
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, []);

  const toggleTestDetails = (testId) => {
    setExpandedTests((prev) => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Nhóm lịch sử theo set_name
  const groupedHistory = testHistory.reduce((acc, history) => {
    const setName = history.set_name;
    if (!acc[setName]) {
      acc[setName] = [];
    }
    acc[setName].push(history);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">⏱️Test History</h1>
          <Link
            to="/"
            className="inline-block mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back
          </Link>
          {loading ? (
            <p className="text-center text-gray-500">Loading test history...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : Object.keys(groupedHistory).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([setName, histories], setIndex) => (
                <div key={setName} className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Question sets: {setName}
                  </h2>
                  <div className="space-y-6">
                    {histories.map((history, index) => (
                      <motion.div
                        key={history.test_id}
                        className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleTestDetails(history.test_id)}
                        >
                          <h3 className="text-lg font-medium text-gray-700">
                          Attempt  {index + 1}
                          </h3>
                          <span className="text-gray-500">
                            {expandedTests[history.test_id] ? '▲' : '▼'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <p className="text-gray-600">
                            <span className="font-medium">Correct:</span> {history.sum_correct}/{history.total_questions}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Time spent:</span> {formatTime(history.time_spent)}
                          </p>
                          <p className="text-gray-600 sm:col-span-2">
                            <span className="font-medium">Time:</span> {new Date(history.completed_at).toLocaleString()}
                          </p>
                        </div>
                        {expandedTests[history.test_id] && (
                          <div className="mt-6 space-y-4">
                            <h4 className="text-md font-semibold text-gray-700">Answer details</h4>
                            {history.answers.map((answer, qIndex) => (
                              <div
                                key={answer.question_id}
                                className={`p-4 rounded-lg ${
                                  answer.is_correct ? 'bg-green-50' : 'bg-red-50'
                                }`}
                              >
                                <h5 className="text-md font-medium text-gray-800">
                                  Question {qIndex + 1}: {answer.question_text}
                                </h5>
                                <div className="mt-2 space-y-2">
                                  <p className="text-gray-600">
                                    <span className="font-medium">Your answer:</span>{' '}
                                    {answer.is_correct ? (
                                      <span className="ml-2 text-green-600">✓ Correct</span>
                                    ) : (
                                      <span className="ml-2 text-red-600">✗ Incorrect</span>
                                    )}
                                  </p>
                                  {!answer.is_correct && (
                                    <p className="text-gray-600">
                                      <span className="font-medium">Correct Answer:</span>{' '}
                                      {answer.correct_answer}
                                    </p>
                                  )}
                                  <div className="mt-2">
                                    <p className="text-gray-600 font-medium">All Answers:</p>
                                    <ul className="list-disc ml-6 text-gray-600">
                                      {answer.answers.map((ans) => (
                                        <li
                                          key={ans._id}
                                          className={
                                            ans.answer_text === answer.correct_answer
                                              ? 'text-green-600'
                                              : ''
                                          }
                                        >
                                          {ans.answer_text}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No test history available.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestHistory;