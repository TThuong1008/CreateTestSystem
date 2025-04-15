import React, { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Trạng thái đăng nhập
  const [username, setUsername] = useState(""); // Tên người dùng sau khi đăng nhập
  const [profilePic, setProfilePic] = useState(""); // Hình ảnh đại diện người dùng

  const login = (name, pic) => {
    setIsLoggedIn(true);
    setUsername(name);
    setProfilePic(pic); // Lưu ảnh đại diện khi đăng nhập
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setProfilePic(""); // Reset ảnh đại diện khi đăng xuất
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, profilePic, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
