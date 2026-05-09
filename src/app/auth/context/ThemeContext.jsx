"use client";
// src/app/auth/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // default dark until localStorage loads

  /* On mount — read saved preference or system preference */
  useEffect(() => {
    const saved = localStorage.getItem("inv-theme");
    if (saved === "light" || saved === "dark") {
      apply(saved);
    } else {
      /* Respect OS preference if no saved choice */
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(prefersDark ? "dark" : "light");
    }
  }, []);

  function apply(t) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("inv-theme", t);
  }

  const toggleTheme = () => apply(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  /* Fail gracefully with a default instead of crashing —
     handles SSR and any component rendered outside provider */
  if (!ctx) {
    return { theme: "dark", toggleTheme: () => {} };
  }
  return ctx;
}