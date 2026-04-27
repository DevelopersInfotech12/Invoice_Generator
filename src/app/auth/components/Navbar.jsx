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
    const check = () => setIsMobile(window.innerWidth < 640);
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
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .nav-logout:hover { background:rgba(248,113,113,.12)!important; color:#F87171!important; border-color:rgba(248,113,113,.3)!important; }
        .nav-link:hover   { color:#E8C97A!important; }

        @media print {
          .inv-navbar { display:none !important; }
        }
      `}</style>

      <nav
        className="inv-navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--nav-bg)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid var(--nav-border)`,
          padding: "0 16px",
          marginTop: "10px", // ✅ added margin top
          fontFamily: "'DM Sans',sans-serif",
          color: "var(--nav-text)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", // ✅ fix responsiveness
          gap: 10,
          minHeight: 62,
        }}>

          {/* Logo */}
          <Link href="/" style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0 // ✅ prevents overflow
          }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <img
                src="/logonew.png"
                alt="Invoice Wallah"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>

            <span
              style={{
                fontSize: isMobile ? 20 : 26, // ✅ smaller on mobile
                fontWeight: 900,
                color: "#E8C97A",
                fontFamily: "'DM Serif Display', serif",
                whiteSpace: "nowrap", // ✅ prevents breaking
                
              }}
            >
              Invoice Wallah
            </span>
          </Link>

          {/* Right side */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 6 : 12,
            flexWrap: "wrap" // ✅ fix overflow
          }}>

            <ThemeToggle />

            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: C.goldBg,
                    border: `1px solid ${C.goldBdr}`,
                    borderRadius: 12,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1A1008",
                  }}>
                    {initials}
                  </div>

                  {!isMobile && ( // ✅ hide name on mobile
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>
                      {user.name?.split(" ")[0]}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    minWidth: 200,
                    background: "#1A1610",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 12px 40px rgba(0,0,0,.65)",
                    animation: "fadeIn .2s ease both",
                  }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "none",
                        border: "none",
                        color: C.text2,
                        cursor: "pointer",
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Link href="/login" style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: `1px solid ${C.border}`,
                  color: "#70655c",
                  fontSize: 11,
                  fontWeight: "700", // ✅ added
                }}>
                  Sign In
                </Link>

                <Link href="/register" style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                  color: "#1A1008",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}