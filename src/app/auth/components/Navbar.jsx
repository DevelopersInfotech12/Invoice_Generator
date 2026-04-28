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
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
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

  if (isMobile === null) return (
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexShrink: 0 }}>
          <img src="/logonew.png" alt="logo" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 22, fontWeight: 900, color: "#E8C97A", whiteSpace: "nowrap" }}>
            Invoice Wallah
          </span>
        </Link>
      </div>
    </nav>
  );

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
      <style>{`
        .nav-signin:hover {
          background: rgba(232,201,122,0.12) !important;
          border-color: rgba(232,201,122,0.6) !important;
        }
        .nav-getstarted:hover {
          background: linear-gradient(135deg,#F0D880,#C89A30) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(232,201,122,0.35) !important;
        }
      `}</style>

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
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: 1,
            flexShrink: 0,
            minWidth: 0,
            textDecoration: "none",
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
              fontSize: isMobile ? 18 : 22,
              fontWeight: 900,
              color: "#E8C97A",
              whiteSpace: "nowrap",
            }}
          >
            Invoice Wallah
          </span>
        </Link>

        {/* Right Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 6 : 10,
            flexShrink: 0,
          }}
        >
          {/* Theme toggle */}
          <ThemeToggle />

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: isMobile ? "5px 8px" : "6px 10px",
                  borderRadius: 10,
                  background: C.goldBg,
                  border: `1px solid ${C.goldBdr}`,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div
                  style={{
                    width: isMobile ? 22 : 26,
                    height: isMobile ? 22 : 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1A1008",
                  }}
                >
                  {initials}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>
                    {user.name?.split(" ")[0]}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--nav-bg)",
                    border: `1px solid ${C.goldBdr}`,
                    borderRadius: 10,
                    padding: "6px",
                    minWidth: 160,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    zIndex: 200,
                  }}
                >
                  <Link
                    href="/invoices"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "9px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: C.text2,
                      textDecoration: "none",
                      borderRadius: 7,
                      transition: "background .15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = C.goldBg}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    My Invoices
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "9px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: C.red,
                      background: "none",
                      border: "none",
                      borderRadius: 7,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "background .15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

              {/* Sign In */}
              <Link
                href="/login"
                className="nav-signin"
                style={{
                  padding: isMobile ? "6px 14px" : "8px 16px",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 700,
                  borderRadius: 8,
                  // ↓ Mobile gets gold gradient, desktop keeps outline style
                  background: isMobile
                    ? "linear-gradient(135deg,#E8C97A,#B8913A)"
                    : "transparent",
                  border: isMobile
                    ? "none"
                    : "1px solid rgba(232,201,122,0.35)",
                  color: isMobile ? "#1A1008" : "#E8C97A",
                  boxShadow: isMobile
                    ? "0 4px 14px rgba(232,201,122,0.25)"
                    : "none",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "all .2s",
                }}
              >
                Sign In
              </Link>

              {/* Get Started — desktop only */}
              {!isMobile && (
                <Link
                  href="/register"
                  className="nav-getstarted"
                  style={{
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                    color: "#1A1008",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(232,201,122,0.25)",
                    transition: "all .2s",
                  }}
                >
                  Get Started
                </Link>
              )}

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}