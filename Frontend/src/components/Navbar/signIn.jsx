import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext"; // Import AuthContext
import loginImg from "../../assets/login.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Lấy function login từ AuthContext

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "a@gmail.com" && password === "123456") {
      setError("");
      login("John Doe", "/path/to/profilePic.jpg"); // Gọi login và truyền tên người dùng, ảnh đại diện
      navigate("/hero"); // Điều hướng sau khi đăng nhập thành công
    } else {
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col md:flex-row w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        <motion.div
          className="w-full md:w-1/2 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={loginImg}
            alt="Login Illustration"
            className="rounded-lg shadow-md max-w-xs"
          />
        </motion.div>
        <motion.div
          className="w-full md:w-1/2 px-6 py-8"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Sign In</h2>
          <form onSubmit={handleSubmit}>
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
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <motion.button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Đăng nhập
            </motion.button>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <a href="/sign-up" className="text-blue-600 hover:underline">
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
