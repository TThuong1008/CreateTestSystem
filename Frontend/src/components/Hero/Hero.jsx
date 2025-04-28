import React, { useContext, useState } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Blob from "../../assets/blob.svg";
import HeroPng from "../../assets/hero.png";
import Navbar from "../Navbar/Navbar";

export const FadeUp = (delay) => ({
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, duration: 0.5, delay, ease: "easeInOut" },
  },
});

const Hero = () => {
  const { isLoggedIn, username, profilePic, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
     navigate("/create-test");
  };

  return (
    <section className="bg-light overflow-hidden relative">
      <Navbar />
      <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
        {/* Brand Info */}
        <div className="flex flex-col justify-center py-14 md:py-0 relative z-20">
          <div className="text-center md:text-left space-y-10 lg:max-w-[400px]">
            <motion.h1
              variants={FadeUp(0.6)}
              initial="initial"
              animate="animate"
              className="text-3xl lg:text-5xl font-bold !leading-snug"
            >
              Let's create and take <span className="text-secondary">Tests</span> using our website
            </motion.h1>
            <motion.div
              variants={FadeUp(0.8)}
              initial="initial"
              animate="animate"
              className="flex justify-center md:justify-start"
            >
              <button
                onClick={handleGetStartedClick}
                className="primary-btn flex items-center gap-2 group"
              >
                Get Started
                <IoIosArrowRoundForward className="text-xl group-hover:translate-x-2 group-hover:-rotate-45 duration-300" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center items-center">
          <motion.img
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
            src={HeroPng}
            alt=""
            className="w-[400px] xl:w-[600px] relative z-10 drop-shadow"
          />
          <motion.img
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
            src={Blob}
            alt=""
            className="absolute -bottom-32 w-[800px] md:w-[1500px] z-[1] hidden md:block"
          />
        </div>
      </div>

      {/* Avatar Dropdown */}
      {isLoggedIn && (
        <div className="absolute top-4 right-8">
          <img
            src={profilePic || "https://via.placeholder.com/150"}
            alt="avatar"
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 bg-white shadow-md rounded py-2 px-4">
              <p className="text-sm font-semibold">{username}</p>
              <button
                onClick={logout}
                className="mt-2 text-sm text-red-500 hover:underline"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}

    </section>
  );
};

export default Hero;
