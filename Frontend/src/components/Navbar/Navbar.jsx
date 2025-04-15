import React, { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { IoMdMenu } from "react-icons/io";
import { motion } from "framer-motion";

const NavbarMenu = [
  { id: 1, title: "Home", path: "/" },
  { id: 2, title: "Services", path: "/services" },
  { id: 3, title: "About Us", path: "/about" },
  { id: 4, title: "Our Team", path: "/team" },
  { id: 5, title: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const { isLoggedIn, username, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="relative z-20">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-10 flex justify-between items-center"
      >
        {/* Logo section */}
        <div>
          <h1 className="font-bold text-2xl">The Testing Online</h1>
        </div>
        {/* Menu section */}
        <div className="hidden lg:block">
          <ul className="flex items-center gap-3">
            {NavbarMenu.map((menu) => (
              <li key={menu.id}>
                <a
                  href={menu.path}
                  className="inline-block py-2 px-3 hover:text-secondary relative group"
                >
                  {menu.title}
                </a>
              </li>
            ))}
            {!isLoggedIn ? (
              <>
                <li>
                  <a href="/sign-in" className="primary-btn">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="/sign-up" className="primary-btn">
                    Sign Up
                  </a>
                </li>
              </>
            ) : (
              <li className="flex items-center gap-2">
                <span className="font-semibold">{username}</span>
                <button
                  onClick={logout}
                  className="primary-btn bg-red-500"
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </div>
        {/* Mobile Hamburger menu section */}
        <div className="lg:hidden">
          <IoMdMenu className="text-4xl" onClick={toggleMenu} />
        </div>
      </motion.div>

      {/* Dropdown menu for mobile */}
      {menuOpen && (
        <div className="absolute top-0 left-0 right-0 bg-white p-5">
          <ul>
            {NavbarMenu.map((menu) => (
              <li key={menu.id}>
                <a
                  href={menu.path}
                  className="block py-2 px-3 hover:text-secondary"
                >
                  {menu.title}
                </a>
              </li>
            ))}
            {!isLoggedIn ? (
              <>
                <li>
                  <a href="/sign-in" className="primary-btn block text-center">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="/sign-up" className="primary-btn block text-center">
                    Sign Up
                  </a>
                </li>
              </>
            ) : (
              <li className="flex flex-col items-center gap-2">
                <span className="font-semibold">{username}</span>
                <button
                  onClick={logout}
                  className="primary-btn bg-red-500 block"
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
