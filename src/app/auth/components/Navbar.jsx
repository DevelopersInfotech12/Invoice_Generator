"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";

const C = {
  gold: "#E8C97A",
  goldDim: "#A8874A",
  goldBg: "rgba(232,201,122,0.10)",
  goldBdr: "rgba(232,201,122,0.30)",
  white: "#FFFFFF",
  text1: "#F5F2EC",
  text2: "#D4CEC5",
  text3: "#9A9080",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.10)",
  red: "#F87171",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480); // ✅ improved breakpoint
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--nav-bg)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--nav-border)",
        padding: "0 10px",
        marginTop: "10px",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          minHeight: 60,
        }}
      >
        {/* ✅ Logo (fixed priority) */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: 1,          // ✅ take space
            flexShrink: 0,    // ✅ prevent shrinking
            minWidth: 0,
          }}
        >
          <img
            src="/logonew.png"
            alt="logo"
            style={{
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
            }}
          />

          <span
            style={{
              fontSize: isMobile ? 15 : 22,
              fontWeight: 900,
              color: "#E8C97A",
              whiteSpace: "nowrap",
            }}
          >
            Invoice Wallah
          </span>
        </Link>

        {/* ✅ Right Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 2 : 8,
            flexShrink: 0,
          }}
        >
          {/* ✅ Smaller toggle on mobile */}
          <div style={{ transform: isMobile ? "scale(0.8)" : "scale(1)" }}>
            <ThemeToggle />
          </div>

          {user ? (
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: isMobile ? "3px 6px" : "4px 8px",
                borderRadius: 10,
                background: C.goldBg,
                border: `1px solid ${C.goldBdr}`,
              }}
            >
              <div
                style={{
                  width: isMobile ? 20 : 22,
                  height: isMobile ? 20 : 22,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                {initials}
              </div>

              {!isMobile && (
                <span style={{ fontSize: 11 }}>
                  {user.name?.split(" ")[0]}
                </span>
              )}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 4 }}>
              <Link
                href="/login"
                style={{
                  padding: isMobile ? "3px 6px" : "4px 8px",
                  fontSize: isMobile ? 9 : 10,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                Sign In
              </Link>

              <Link
                href="/register"
                style={{
                  padding: isMobile ? "3px 6px" : "4px 8px",
                  fontSize: isMobile ? 9 : 10,
                  borderRadius: 6,
                  background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                  color: "#1A1008",
                  whiteSpace: "nowrap",
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}