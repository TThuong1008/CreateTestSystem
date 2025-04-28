import React, { useState, useContext, useEffect  } from "react";
import Navbar from "../Navbar/Navbar";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";
import { IoMdCloudUpload, IoMdCheckmarkCircle } from "react-icons/io"; // Import thêm icon
import { FaRegFilePdf, FaLock, FaLockOpen, FaHistory } from "react-icons/fa"; // Icon PDF
import { IoPulseOutline } from "react-icons/io5"; // Missing import for IoPulseOutline
import { jsPDF } from "jspdf"; // Import jsPDF
import CreateTestForm from "./createTestForm";
import QuestionList from "./questionList";
import TestContent from "./takeTest"; // Import TestContent component
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const CreateTest = () => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('createTest');
  const [questionsList, setQuestionsList] = useState([]);
  const [isTestStarted, setIsTestStarted] = useState(false); // Thêm dòng này
  const [activeSetId, setActiveSetId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionSets, setQuestionSets] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== 'takeTest') {
      setIsTestStarted(false); // Reset when switching to a tab other than takeTest
      setActiveSetId(null);
    }else {
      fetchQuestionSets(); // Fetch question sets when switching to takeTest tab
  }
};

  const handleGenerateQuestions = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
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

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!isLoggedIn || !token) {
        console.log("User not logged in or token missing");
        setQuestionSets([]);
        setLoading(false);
        return;
      }
      // API call with proper Bearer token format
      const response = await axios.get(
        `http://localhost:8000/api/question-sets?include_public=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`  // Ensure correct Bearer format
          }
        }
      );
      setQuestionSets(response.data);
    } catch (err) {
      console.error("Error fetching question sets:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError("Không thể tải danh sách bộ câu hỏi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (setId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Bạn cần đăng nhập để thực hiện hành động này');
        navigate('/login'); // Chuyển hướng đến trang đăng nhập nếu không có token
        return;
      }

      // Gửi yêu cầu toggle status với token trong header
      const response = await axios.put(
        `http://localhost:8000/api/question-sets/${setId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQuestionSets(prevSets => 
        prevSets.map(set => 
          set._id === setId 
            ? { ...set, status: response.data.status } 
            : set
        )
      );
      alert(response.data.message); // Hiển thị thông báo thành công, ví dụ: "Question set status updated to public"
    } catch (error) {
      console.error('Error toggling question set status:', error);
      if (error.response?.status === 401) {
        alert('Session has expired. Please log in again.');
        localStorage.removeItem('access_token'); // Xóa token cũ
        navigate('/login'); // Chuyển hướng đến trang đăng nhập
      } else if (error.response?.status === 404) {
        alert(`Question set with ID ${setId} not exist.`);
      } else if (error.response?.status === 500) {
        alert('You do not have permission to edit this question set.');
      } else {
        alert('An error has occurred. Please try again.');
      }
    }
  };
  const handleStartTest = (setId) => {
    setActiveSetId(setId); // Store the active set ID
    setIsTestStarted(true); // Update the state to indicate the test has started
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const handleHistoryClick = () => {
    navigate('/test-history');
  };

  return (
    <section className="bg-gray-100 min-h-screen flex flex-col py-10">
      <Navbar />
      <div className="container mx-auto px-4">
        {isLoggedIn ? (
          <h1 className="text-center text-3xl font-bold text-blue-600 mb-6">Services we provide</h1>
        ) : (
          <h1 className="text-center text-3xl font-bold text-red-600 mb-6">You are not logged in!</h1>
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
          className={`primary-btn ${activeTab === 'Support' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
          onClick={handleHistoryClick}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <FaHistory className="inline-block mr-2" /> Quiz history
        </motion.div>
      </div>

      {/* Nội dung theo tab */}
      <div className="container mx-auto m-0 p-0 flex flex-col lg:flex-row gap-6">
        {/* Cột bên trái (Danh sách bộ câu hỏi) */}
        <div className={`flex-[3] ${activeTab === 'takeTest' ? 'lg:w-1/4' : 'hidden'}`}>
          {activeTab === 'takeTest' && (
            <motion.div
              className="bg-white shadow-md rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center text-xl font-semibold mb-4 text-blue-600">
              List of question sets
              </h2>
              {questionSets.length > 0 && isLoggedIn ? (
                <div className="space-y-1">
                  {questionSets.map((set) => (
                    <div
                      key={set._id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-blue-600">{set.set_name}</h3>
                          </div>
                          <div>
                          <p className="text-sm text-gray-500 flex items-center">
                          <button 
                          onClick={() => handleToggleStatus(set._id)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title={set.status === 'public' ? 'Public' : 'Private'}
                        >
                          {set.status === 'public' ? (
                            <FaLockOpen className="text-green-500" />
                          ) : (
                            <FaLock className="text-gray-500" />
                          )}
                        </button>
                            {new Date(set.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadPDF(set._id)}
                          className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors flex items-center justify-center"
                        >
                          <FaRegFilePdf className="mr-1" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleStartTest(set._id)}
                          className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors flex items-center justify-center"
                        >
                          <IoPulseOutline className="mr-1" />
                          Test Online
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : 
              (
                <p className="text-center text-gray-500">
                  Please Log in to view your question sets.
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Cột bên phải (Nội dung bài kiểm tra) */}
        <div className={`flex-[7] ${activeTab === 'takeTest' ? 'lg:w-3/4' : 'hidden'}`}>
          <TestContent isTestStarted={isTestStarted} set_id={activeSetId} />
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
