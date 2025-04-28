import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaRegFilePdf, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from "../../AuthContext";

const QuestionList = ({ questionsList, handleDownloadPDF, loading }) => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [setName, setSetName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [setStatus, setSetStatus] = useState('private'); 

  const handleSaveQuestionSet = async () => {
    if (!setName.trim()) {
      alert("Vui lòng nhập tên bộ câu hỏi");
      return;
    }
  
    setSaveLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token && !isLoggedIn) {
        alert("Bạn cần đăng nhập để lưu bộ câu hỏi");
        setSaveLoading(false);
        return;
      }
      
      const response = await axios.post(
        "http://localhost:8000/api/save_question", 
        {
          set_name: setName,
          status: setStatus,
          questions: questionsList
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Add the token here
          },
        }
      );
  
      alert("Lưu bộ câu hỏi thành công!");
      setShowSaveModal(false);
      setSetName("");
    } catch (error) {
      console.error("Error saving question set:", error);
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        alert(error.response?.data?.detail || "Lưu bộ câu hỏi thất bại");
      }
    } finally {
      setSaveLoading(false);
    }
  };
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6 mt-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Loading overlay */}
      {(loading || saveLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Please wait...</span>
          </div>
        </div>
      )}

      {/* Header với các nút */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">List of question sets</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={questionsList.length === 0}
          >
            <FaSave className="text-xl" />
            Save question set
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={questionsList.length === 0}
          >
            <FaRegFilePdf className="text-xl" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Modal lưu bộ câu hỏi */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4">Save question</h3>
              <input
                type="text"
                placeholder="Nhập tên bộ câu hỏi"
                className="w-full p-2 border rounded mb-4"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
              />
              
              {/* Thêm lựa chọn trạng thái */}
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">Status:</p>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="private"
                      checked={setStatus === 'private'}
                      onChange={() => setSetStatus('private')}
                      className="mr-2"
                    />
                    <span>Riêng tư</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="public"
                      checked={setStatus === 'public'}
                      onChange={() => setSetStatus('public')}
                      className="mr-2"
                    />
                    <span>Công khai</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveQuestionSet}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

      {questionsList.length > 0 ? (
        <div className="space-y-6">
          {questionsList.map((question, index) => (
            <div key={index} className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">
                Câu {index + 1}: {question.question}
              </h3>

              <div className="space-y-2 ml-4">
                {question.options.map((option, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      className="w-4 h-4"
                      disabled
                    />
                    <span className="text-gray-700">
                      {option.text}
                      {option.is_correct && (
                        <span className="text-green-600 text-sm ml-2">
                          (Correct answer)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No question sets available. Create your first question set now!
        </p>
      )}
    </motion.div>
  );
};

export default QuestionList;