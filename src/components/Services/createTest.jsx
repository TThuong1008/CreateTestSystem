import React, { useState, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";
import { IoMdCloudUpload, IoMdCheckmarkCircle } from "react-icons/io"; // Import thêm icon
import { FaRegFilePdf } from "react-icons/fa"; // Icon PDF
import { IoPulseOutline } from "react-icons/io5"; // Missing import for IoPulseOutline
import { BiSupport } from "react-icons/bi"; // Missing import for BiSupport
import { jsPDF } from "jspdf"; // Import jsPDF

const CreateTest = () => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('createTest');
  const [questionsList, setQuestionsList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Danh sách câu hỏi trắc nghiệm mẫu
  const [questions] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris"
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      answer: "Mars"
    },
    {
      id: 3,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Shakespeare", "Dickens", "Hemingway", "Austen"],
      answer: "Shakespeare"
    }
  ]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsTestStarted(false); // Reset when switching tabs
  };

  const handleGenerateQuestions = () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file trước khi tạo câu hỏi.");
      return;
    }

    setQuestionsList([...questionsList, { id: questionsList.length + 1, fileName: selectedFile.name }]);
    setSelectedFile(null); // Reset file chọn
    setSuccessMessage("Tạo câu hỏi thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartTest = () => {
    setIsTestStarted(true); // Bắt đầu bài kiểm tra
  };

  // Hàm tạo và tải xuống PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    // Thêm tiêu đề
    doc.setFontSize(18);
    doc.text("Danh sách câu hỏi trắc nghiệm", 10, y);
    y += 10;

    // Thêm các câu hỏi vào PDF
    questions.forEach((question, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${question.question}`, 10, y);
      y += 10;

      question.options.forEach((option, i) => {
        doc.text(`  ${String.fromCharCode(65 + i)}. ${option}`, 15, y);
        y += 7;
      });

      y += 5; // Khoảng cách giữa câu hỏi
    });

    // Lưu PDF và cho phép tải xuống
    doc.save("cau_hoi_trac_nghiem.pdf");
  };

  // Prevent form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // handle form submit actions (e.g., validate and show results)
  };

  return (
    <section className="bg-gray-100 min-h-screen flex flex-col py-10">
      <Navbar />
      <div className="container mx-auto px-4">
        {isLoggedIn ? (
          <h1 className="text-center text-3xl font-bold text-blue-600 mb-6">Services we provide</h1>
        ) : (
          <h1 className="text-center text-3xl font-bold text-red-600 mb-6">Bạn chưa đăng nhập!</h1>
        )}
      </div>

      {/* Các nút tab */}
      <div className="container mx-auto flex justify-center gap-6 mb-8">
        <motion.div
          className={`primary-btn ${activeTab === 'createTest' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={() => handleTabClick('createTest')}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <IoMdCheckmarkCircle className="inline-block mr-2" /> Create Test
        </motion.div>
        <motion.div
          className={`primary-btn ${activeTab === 'takeTest' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={() => handleTabClick('takeTest')}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <FaRegFilePdf className="inline-block mr-2" /> Take Test
        </motion.div>
        <motion.div
          className={`primary-btn ${activeTab === 'satisfiedClients' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={() => handleTabClick('satisfiedClients')}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <FaRegFilePdf className="inline-block mr-2" /> Satisfied Clients
        </motion.div>
        <motion.div
          className={`primary-btn ${activeTab === 'SEOOptimization' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={() => handleTabClick('SEOOptimization')}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <IoPulseOutline className="inline-block mr-2" /> SEO Optimization
        </motion.div>
        <motion.div
          className={`primary-btn ${activeTab === 'Support' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={() => handleTabClick('Support')}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <BiSupport className="inline-block mr-2" /> 24/7 Support
        </motion.div>
      </div>

      {/* Nội dung theo tab */}
      <div className="container mx-auto flex flex-col lg:flex-row gap-6">
        {/* Cột bên trái (nơi tạo câu hỏi) */}
        <div className={`flex-1 ${activeTab === 'takeTest' ? 'lg:w-1/5' : 'hidden'}`}>
          {activeTab === 'takeTest' && (
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
                    <li key={question.id} className="py-2 border-b flex items-center justify-between">
                      <span className="font-semibold text-blue-500">{question.fileName}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleDownloadPDF} // Gọi hàm để tạo và tải PDF
                          className="secondary-btn"
                        >
                          <FaRegFilePdf className="inline-block mr-2" /> Xuất ra PDF
                        </button>
                        <button 
                          onClick={handleStartTest} 
                          className="primary-btn"
                        >
                          <IoMdCloudUpload className="inline-block mr-2" /> Test Online
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">Chưa có câu hỏi nào. Tạo một bài kiểm tra đầu tiên!</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Cột bên phải (nơi hiển thị bài kiểm tra khi nhấn "Test Online") */}
        <div className={`flex-1 ${activeTab === 'takeTest' ? 'lg:w-4/5' : 'hidden'}`}>
          {isTestStarted ? (
            <motion.div
              className="bg-white shadow-lg rounded-lg p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center text-2xl font-bold mb-6">Bài Kiểm Tra</h2>
              <form onSubmit={handleFormSubmit}>
                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <p className="font-semibold">{index + 1}. {question.question}</p>
                    <div className="flex flex-col mt-2">
                      {question.options.map((option, idx) => (
                        <label key={idx} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
                  Nộp Bài
                </button>
              </form>
            </motion.div>
          ) : (
            <p className="text-center text-gray-500">Chọn câu hỏi và nhấn "Test Online" để bắt đầu.</p>
          )}
        </div>
      </div>

      {/* Tạo câu hỏi (khi nhấn vào Create Test) */}
      {activeTab === 'createTest' && (
        <motion.div
          className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <label className="block mb-4">
            <span className="text-gray-700 font-semibold">Chọn file văn bản:</span>
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              className="block w-full mt-2 p-2 border rounded"
              onChange={handleFileChange}
            />
          </label>
          <motion.button
            onClick={handleGenerateQuestions}
            className="primary-btn"
            whileHover={{ scale: 1.05 }}
          >
            <IoMdCloudUpload className="inline-block mr-2" /> Tạo câu hỏi trắc nghiệm
          </motion.button>

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mt-4 text-center text-green-600 font-semibold">
              {successMessage}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
};

export default CreateTest;
