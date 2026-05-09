"use client";
// src/app/components/ThemeToggle.jsx
import { useTheme } from "../auth/context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.05)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.10)",
        color: isDark ? "#E8C97A" : "#8A6A20",
        transition: "all .2s",
        flexShrink: 0,
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = isDark
          ? "rgba(232,201,122,0.12)"
          : "rgba(232,201,122,0.15)";
        e.currentTarget.style.borderColor = "rgba(232,201,122,0.45)";
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = isDark
          ? "rgba(255,255,255,0.12)"
          : "rgba(0,0,0,0.10)";
      }}
    >
      {isDark ? (
        /* Sun — click to go light */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1"  x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1"  y1="12" x2="3"  y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon — click to go dark */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}