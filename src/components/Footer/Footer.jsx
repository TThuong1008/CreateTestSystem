import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { TbWorldWww } from "react-icons/tb";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-28 bg-[#f7f7f7]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 md:gap-4">
          {/* first section */}
          <div className="space-y-4 max-w-[300px]">
            <h1 className="text-2xl font-bold">The Testing Online</h1>
            <p className="text-dark2">
              Testing Online is a platform allows users to automatically generate multiple-choice quizzes from any input text. 
              It analyzes the text to create relevant questions, including multiple-choice, true/false, and fill-in-the-blank formats. 
              Quizzes can be used online or downloaded in various formats like PDF or Word for easy sharing and distribution
            </p>
          </div>
          {/* second section */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Courses</h1>
              <div className="text-dark2">
                <ul className="space-y-2 text-lg">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Create Test
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Take Test
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Teaching
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    E-learning
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Links</h1>
              <div className="text-dark2">
                <ul className="space-y-2 text-lg">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Home
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Services
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    About
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Contact
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* third section */}
          <div className="space-y-4 max-w-[300px]">
            <h1 className="text-2xl font-bold">Get In Touch</h1>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter your email"
                className="p-3 rounded-s-xl bg-white w-full py-4 focus:ring-0 focus:outline-none placeholder:text-dark2"
              />
              <button className="bg-primary text-white font-semibold py-4 px-6 rounded-e-xl">
                Go
              </button>
            </div>
            {/* social icons */}
            <div className="flex space-x-6 py-3">
              <a href="https://daotao.vku.udn.vn/">
                <FaWhatsapp className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
              <a href="https://daotao.vku.udn.vn/">
                <FaInstagram className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
              <a href="https://daotao.vku.udn.vn/">
                <TbWorldWww className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
              <a href="https://daotao.vku.udn.vn/">
                <FaYoutube className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
