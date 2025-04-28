import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdCloudUpload } from 'react-icons/io';

const CreateTestForm = ({ handleFileChange, handleGenerateQuestions, successMessage }) => {
  return (
    <motion.div
      className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <label className="block mb-4">
        <span className="text-gray-700 font-semibold">Choose a document file (docx, pdf, pptx):</span>
        <input
          type="file"
          accept=".doc,.docx,.pdf,.pptx"
          className="block w-full mt-2 p-2 border rounded"
          onChange={handleFileChange}
        />
      </label>
      <motion.button
        onClick={handleGenerateQuestions}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        whileHover={{ scale: 1.05 }}
      >
        <IoMdCloudUpload className="inline-block mr-2" /> Generate multiple-choice questions
      </motion.button>

      {successMessage && (
        <div className="mt-4 text-center text-green-600 font-semibold">
          {successMessage}
        </div>
      )}
    </motion.div>
  );
};

export default CreateTestForm;
