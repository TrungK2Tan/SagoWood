import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const ThemeContext = createContext();

// Custom hook to use the ThemeContext
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component to wrap around the app
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const element = document.documentElement; // the <html> element
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
