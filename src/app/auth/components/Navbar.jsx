"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth }   from "../hooks/useAuth.js";
import { useRouter } from "next/navigation";
import Link          from "next/link";
import { useTheme }  from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap');
        @keyframes navFadeIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nav-logout:hover {
          background: rgba(248,113,113,.12) !important;
          color: #F87171 !important;
        }
        .nav-link:hover {
          color: #E8C97A !important;
          background: var(--inv-surface-hover) !important;
        }
        .nav-avatar-btn:hover {
          border-color: rgba(232,201,122,.55) !important;
        }
        @media print { .inv-navbar { display:none !important; } }
        @media (max-width: 480px) {
          .inv-navbar-inner { height: 50px !important; }
          .inv-navbar { padding: 0 12px !important; }
          .inv-logo-text { font-size: 12px !important; }
          .inv-logo-img { width: 26px !important; height: 26px !important; }
          .inv-logo-gap { gap: 6px !important; }
          .inv-right { gap: 6px !important; }
          .inv-theme-btn { width: 30px !important; height: 30px !important; }
          .inv-auth-link { padding: 6px 10px !important; font-size: 11px !important; }
          .inv-auth-cta  { padding: 6px 10px !important; font-size: 11px !important; }
          .inv-auth-gap  { gap: 6px !important; }
        }
      `}</style>

      <nav className="inv-navbar" style={{
        position: "sticky", top: 0,
        zIndex: 500,
        background: "var(--inv-nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--inv-nav-border)",
        padding: "0 24px",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div className="inv-navbar-inner" style={{
          maxWidth: 1160, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}>

          {/* ── Logo ── */}
          <Link href="/" className="inv-logo-gap" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:9 }}>
            <img
              className="inv-logo-img"
              src="/logonew.png"
              alt="Invoice Wallah"
              style={{
                width: 34,
                height: 34,
                objectFit: "contain",
                borderRadius: 8,
              }}
              onError={e => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
            {/* SVG fallback */}
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0,
              background:"linear-gradient(135deg,#E8C97A,#B8913A)",
              display:"none", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 12px rgba(232,201,122,.3)",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1008" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="9" y1="7"  x2="15" y2="7"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
                <line x1="9" y1="15" x2="12" y2="15"/>
              </svg>
            </div>
            <span className="inv-logo-text" style={{
              fontSize:18,
              fontWeight:700,
              color: "#C5A04B",
              fontFamily:"'Poppins','system-ui',sans-serif", letterSpacing:"-.01em",
            }}>
              Invoice Wallah
            </span>
          </Link>

          {/* ── Right side ── */}
          <div className="inv-right" style={{ display:"flex", alignItems:"center", gap:9 }}>

            {/* Theme toggle */}
            <button
              className="inv-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width:36, height:36,
                borderRadius:9,
                cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: "transparent",
                border: "1px solid var(--inv-border)",
                color: "var(--inv-text3)",
                transition:"all .2s", flexShrink:0,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = "rgba(232,201,122,0.55)";
                e.currentTarget.style.color = "#E8C97A";
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = "var(--inv-border)";
                e.currentTarget.style.color = "var(--inv-text3)";
              }}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* ── User menu or auth links ── */}
            {user ? (
              <div ref={menuRef} style={{ position:"relative" }}>

                <button
                  className="nav-avatar-btn"
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display:"flex", alignItems:"center", gap:9,
                    background: "rgba(232,201,122,0.10)",
                    border: "1px solid rgba(232,201,122,0.30)",
                    borderRadius:11, padding:"6px 13px 6px 7px",  /* was 7/14/7/8 → -1px each */
                    cursor:"pointer", transition:"border-color .2s",
                  }}
                >
                  {user.avatar ? (
                    <>
                      <img src={user.avatar} alt={user.name}
                        style={{ width:27, height:27, borderRadius:"50%", objectFit:"cover" }}  /* was 28 → -1px */
                        onError={e => {
                          e.currentTarget.style.display="none";
                          e.currentTarget.nextElementSibling.style.display="flex";
                        }}/>
                      <div style={{
                        width:27, height:27, borderRadius:"50%",
                        background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                        display:"none", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:800, color:"#1A1008", flexShrink:0,
                      }}>
                        {initials}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      width:27, height:27, borderRadius:"50%",
                      background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:10, fontWeight:800, color:"#1A1008", flexShrink:0,
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--inv-text1)" }}>
                    {user.name?.split(" ")[0]}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#A8874A" strokeWidth="2.5"
                    style={{
                      transform: menuOpen ? "rotate(180deg)" : "none",
                      transition:"transform .2s", flexShrink:0,
                    }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div style={{
                    position:"absolute",
                    top:"calc(100% + 8px)",
                    right:0,
                    minWidth:220,
                    background: "var(--inv-dropdown-bg)",
                    border: "1px solid var(--inv-border)",
                    borderRadius:14,
                    overflow:"hidden",
                    boxShadow:"0 16px 48px rgba(0,0,0,.35)",
                    animation:"navFadeIn .18s ease both",
                    zIndex:9999,
                  }}>
                    <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--inv-border)" }}>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--inv-text1)" }}>
                        {user.name}
                      </p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--inv-text3)" }}>
                        {user.email}
                      </p>
                    </div>

                    {[
                      {
                        label:"My Invoices", href:"/invoices",
                        icon:(
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        ),
                      },
                      {
                        label:"Profile", href:"/profile",
                        icon:(
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        ),
                      },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nav-link"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display:"flex", alignItems:"center", gap:10,
                          padding:"11px 16px", textDecoration:"none",
                          fontSize:13, color:"var(--inv-text2)",
                          transition:"all .15s",
                          borderBottom:"1px solid var(--inv-border)",
                        }}
                      >
                        <span style={{ color:"var(--inv-text3)" }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <button
                      className="nav-logout"
                      onClick={handleLogout}
                      style={{
                        width:"100%", display:"flex", alignItems:"center", gap:10,
                        padding:"11px 16px", textAlign:"left",
                        background:"none", border:"none",
                        borderTop:"1px solid var(--inv-border)",
                        fontSize:13, color:"var(--inv-text3)", cursor:"pointer",
                        transition:"all .2s", fontFamily:"inherit",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>

            ) : (
              <div className="inv-auth-gap" style={{ display:"flex", gap:9 }}>
                <Link href="/login" className="inv-auth-link" style={{
                  padding:"8px 17px", borderRadius:10, textDecoration:"none",
                  border:"1.5px solid var(--inv-border)",
                  color:"var(--inv-text2)",
                  fontSize:13, fontWeight:600, transition:"all .2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor="rgba(232,201,122,0.45)"; e.currentTarget.style.color="#E8C97A"; }}
                  onMouseOut={e  => { e.currentTarget.style.borderColor="var(--inv-border)";       e.currentTarget.style.color="var(--inv-text2)"; }}>
                  Sign In
                </Link>
                <Link href="/register" className="inv-auth-cta" style={{
                  padding:"8px 17px", borderRadius:10, textDecoration:"none",
                  background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                  color:"#1A1008", fontSize:13, fontWeight:700,
                  boxShadow:"0 2px 10px rgba(232,201,122,.25)",
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