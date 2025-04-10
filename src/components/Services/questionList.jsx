import React from 'react';

const QuestionList = ({ questionsList, handleStartTest }) => {
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-center text-2xl font-bold mb-6">Danh sách câu hỏi đã tạo</h2>
      {questionsList.length > 0 ? (
        <ul>
          {questionsList.map((question) => (
            <li key={question.id} className="py-2 border-b">
              <span className="font-semibold">{question.fileName}</span>
              <div className="mt-2 flex gap-4">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Xuất ra PDF
                </button>
                <button
                  onClick={() => handleStartTest()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Test Online
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Chưa có câu hỏi nào. Tạo một bài kiểm tra đầu tiên!</p>
      )}
    </motion.div>
  );
};

export default QuestionList;
