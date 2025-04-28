import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Để sử dụng biểu tượng mắt
import signUpImg from "../../assets/login.png";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [username, setUsername] = useState(""); // State cho tên người dùng
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    const user = { username, email, password };

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Đăng ký thành công!");
        navigate("/sign-in"); // Chuyển hướng tới trang đăng nhập khi đăng ký thành công
      } else {
        setError(data.detail);  // Hiển thị lỗi nếu không thành công
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col md:flex-row-reverse w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        {/* Hình ảnh - Adjusted margin to bring image closer */}
        <motion.div
          className="w-full md:w-1/2 flex justify-center items-center p-4" // Added padding to bring closer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={signUpImg}
            alt="Sign Up Illustration"
            className="rounded-lg shadow-md max-w-xs" // Set max-width for image size
          />
        </motion.div>

        {/* Form đăng ký */}
        <motion.div
          className="w-full md:w-1/2 px-6 py-8"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            {/* Tên người dùng Field */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-medium">
                Tên người dùng
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Nhập tên người dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-gray-700 font-medium">
                Mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6 relative">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium">
                Xác nhận mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Đăng ký
            </motion.button>

            {/* Link chuyển sang trang đăng nhập */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <a href="/sign-in" className="text-blue-600 hover:underline">
                  Đăng nhập ngay
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
