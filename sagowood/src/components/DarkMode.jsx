import React from "react";
import lightPng from "../assets/light-mode-button.png";
import darkPng from "../assets/dark-mode-button.png";
import { useTheme } from "../components/Theme/ThemeContext";

const DarkMode = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative">
      <img
        src={lightPng}
        alt="Enable light mode"
        onClick={toggleTheme}
        className={`w-12 cursor-pointer drop-shadow-[1px_1px_1px_rgba(0,0,0,0.1)] transition-all duration-300 absolute right-0 z-10 ${
          theme === "dark" ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={darkPng}
        alt="Enable dark mode"
        onClick={toggleTheme}
        className={`w-12 cursor-pointer drop-shadow-[1px_1px_1px_rgba(0,0,0,0.1)] transition-all duration-300 ${
          theme === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default DarkMode;
