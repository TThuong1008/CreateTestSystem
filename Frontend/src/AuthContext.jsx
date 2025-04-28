import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Sửa import

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const login = (name, pic, token) => {
    setIsLoggedIn(true);
    setUsername(name);
    setProfilePic(pic);
    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("username", name);
    localStorage.setItem("profilePic", pic);
    localStorage.setItem("access_token", token);
  };

  const loadUserFromLocalStorage = () => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username");
    const storedProfilePic = localStorage.getItem("profilePic");
    const token = localStorage.getItem("access_token");

    if (storedIsLoggedIn && token) {
      const decodedToken = jwtDecode(token); // Sử dụng hàm giải mã đúng cách
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp > currentTime) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        setProfilePic(storedProfilePic);
      } else {
        logout();
      }
    }
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setProfilePic("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePic");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, profilePic, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;