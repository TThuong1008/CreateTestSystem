import React, { useState, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";
import { IoMdCloudUpload, IoMdCheckmarkCircle } from "react-icons/io"; // Import thêm icon
import { FaRegFilePdf } from "react-icons/fa"; // Icon PDF
import { IoPulseOutline } from "react-icons/io5"; // Missing import for IoPulseOutline
import { BiSupport } from "react-icons/bi"; // Missing import for BiSupport
import { jsPDF } from "jspdf"; // Import jsPDF
import CreateTestForm from "./createTestForm";
import QuestionList from "./questionList";
import axios from "axios";

const CreateTest = () => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('createTest');
  const [questionsList, setQuestionsList] = useState([]);
  const [isTestStarted, setIsTestStarted] = useState(false); // Thêm dòng này
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // setIsTestStarted(false); // Reset when switching tabs
  };

  const handleGenerateQuestions = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await axios.post(
        "http://localhost:8000/api/generate-questions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setQuestionsList(response.data.questions);
      // setSuccessMessage("Tạo câu hỏi thành công!");
      // setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadPDF = async () => {
    try {
      console.log("Data sent to backend:", JSON.stringify({ questions: questionsList }, null, 2));

    const response = await axios.post(
      "http://localhost:8000/api/generate-pdf",
      { questions: questionsList }, // Đúng cấu trúc
      { 
        responseType: "blob",
        headers: {
          "Content-Type": "application/json" // Thêm header này
        }
      }
    );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "exam_questions.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  const handleStartTest = () => {
    setIsTestStarted(true); // Bắt đầu bài kiểm tra
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column - File upload */}
        <motion.div 
          className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg"
        >
          <CreateTestForm 
          handleFileChange={handleFileChange}
          handleGenerateQuestions={handleGenerateQuestions} // Truyền hàm vào đây
          selectedFile={selectedFile}
        />
        </motion.div>

        {/* Right column - Questions list */}
        <motion.div 
          className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
        >
          <QuestionList 
          questionsList={questionsList} 
          handleDownloadPDF={handleDownloadPDF}
          loading={loading}
        />
        </motion.div>
      </motion.div>
      )}
    </section>
  );
};

export default CreateTest;
