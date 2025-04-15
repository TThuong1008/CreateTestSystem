import React from 'react';
import { motion } from 'framer-motion';

const TestContent = ({ isTestStarted }) => {
  return (
    <div className={`flex-1 ${isTestStarted ? 'w-2/3' : 'hidden'}`}>
      {isTestStarted ? (
        <motion.div
          className="bg-white shadow-lg rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-2xl font-bold mb-6">Bài Kiểm Tra</h2>
          <p>Đây là phần bài kiểm tra của bạn. Bạn có thể bắt đầu làm bài kiểm tra tại đây.</p>
        </motion.div>
      ) : (
        <p className="text-center text-gray-500">Chọn câu hỏi và nhấn "Test Online" để bắt đầu.</p>
      )}
    </div>
  );
};

export default TestContent;
