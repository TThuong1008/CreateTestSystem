import React from 'react';
import { motion } from 'framer-motion';
import { FaRegFilePdf } from 'react-icons/fa';

const QuestionList = ({ questionsList, handleDownloadPDF, loading  }) => {
  const loadingSpinner = (
    <div className="flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">Đang tải...</span>
    </div>
  );
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6 mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          {loadingSpinner}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh sách câu hỏi</h2>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={questionsList.length === 0}
        >
          <FaRegFilePdf className="text-xl" />
          Xuất toàn bộ PDF
        </button>
      </div>

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
                          (Đáp án đúng)
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
          Chưa có câu hỏi nào được tạo
        </p>
      )}
    </motion.div>
  );
};

export default QuestionList;