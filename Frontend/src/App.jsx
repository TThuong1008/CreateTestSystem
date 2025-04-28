import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { AuthContext } from "./AuthContext";
import Hero from "./components/Hero/Hero";
import Services from "./components/Services/Services";
import Banner from "./components/Banner/Banner";
import Subscribe from "./components/Subscribe/Subscribe";
import Banner2 from "./components/Banner/Banner2";
import Footer from "./components/Footer/Footer";
import LoginPage from "./components/Navbar/signIn";
import SignUpPage from "./components/Navbar/signUp";
import CreateTest from "./components/Services/createTest";
import TestHistory from "./components/Services/testHistory";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/sign-in" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Services />
              <Banner />
              <Subscribe />
              <Banner2 />
              <Footer />
            </>
          }/>
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/test-history" element={
             <PrivateRoute>
            <TestHistory />
            </PrivateRoute>} />
          <Route path="/create-test" element={
          <>
              <CreateTest />
              <Footer />
              </>
          }/>   

          {/* <Route path="/hero" element={
            <>
            <Hero />
            <Services />
            <Banner />
            <Subscribe />
            <Banner2 />
            <Footer />
          </>}/> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
