"use client";
import { useState }  from "react";
import { useAuth }   from "../hooks/useAuth.js";
import { useRouter } from "next/navigation";
import Link          from "next/link";

const C = {
  gold:"#E8C97A", goldDim:"#A8874A", goldBg:"rgba(232,201,122,0.10)",
  goldBdr:"rgba(232,201,122,0.30)", white:"#FFFFFF",
  text1:"#F5F2EC", text2:"#D4CEC5", text3:"#9A9080",
  surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.10)",
  red:"#F87171",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

        /* ── Hide Navbar completely when printing ── */
        @media print {
          .inv-navbar { display:none !important; }
        }
      `}</style>

      <nav
        className="inv-navbar"
        style={{
          position:"sticky", top:0, zIndex:100,
          background:"rgba(14,12,9,0.92)",
          backdropFilter:"blur(12px)",
          borderBottom:`1px solid ${C.border}`,
          padding:"0 24px",
          fontFamily:"'DM Sans',sans-serif",
        }}
      >
        <div style={{
          maxWidth:1160, margin:"0 auto",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", height:62,
        }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:"linear-gradient(135deg,#E8C97A,#B8913A)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 12px rgba(232,201,122,.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1008" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="9" y1="7"  x2="15" y2="7"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
                <line x1="9" y1="15" x2="12" y2="15"/>
              </svg>
            </div>
            <span style={{
              fontSize:16, fontWeight:700, color:C.white,
              fontFamily:"'DM Serif Display',serif", letterSpacing:"-.01em",
            }}>
              Invoice Wallah
            </span>
          </Link>

          {/* ── Right side ── */}
          {user ? (
            <div style={{ position:"relative" }}>

              {/* Avatar button */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:C.goldBg, border:`1px solid ${C.goldBdr}`,
                  borderRadius:12, padding:"7px 14px 7px 8px",
                  cursor:"pointer", transition:"all .2s",
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = "rgba(232,201,122,.55)"}
                onMouseOut={e  => e.currentTarget.style.borderColor = C.goldBdr}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                    style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover" }}/>
                ) : (
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, color:"#1A1008", flexShrink:0,
                  }}>
                    {initials}
                  </div>
                )}
                <span style={{ fontSize:13, fontWeight:600, color:C.text1 }}>
                  {user.name?.split(" ")[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={C.goldDim} strokeWidth="2.5"
                  style={{ transform:menuOpen?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* ── Dropdown ── */}
              {menuOpen && (
                <div style={{
                  position:"absolute", top:"calc(100% + 10px)", right:0,
                  minWidth:210,
                  background:"#1A1610", border:`1px solid ${C.border}`,
                  borderRadius:14, overflow:"hidden",
                  boxShadow:"0 12px 40px rgba(0,0,0,.65)",
                  animation:"fadeIn .2s ease both",
                  zIndex:200,
                }}>
                  {/* User info */}
                  <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}` }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text1 }}>
                      {user.name}
                    </p>
                    <p style={{ margin:"2px 0 0", fontSize:11, color:C.text3 }}>
                      {user.email}
                    </p>
                  </div>

                  {/* Menu links */}
                  {[
                    { label:"My Invoices", href:"/invoices", icon:(
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    )},
                    { label:"Profile", href:"/profile", icon:(
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )},
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-link"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"11px 16px", textDecoration:"none",
                        fontSize:13, color:C.text2,
                        transition:"color .2s",
                        borderBottom:`1px solid rgba(255,255,255,.04)`,
                      }}
                    >
                      <span style={{ color:C.text3 }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <button
                    className="nav-logout"
                    onClick={handleLogout}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", gap:10,
                      padding:"11px 16px", textAlign:"left",
                      background:"none", border:"none",
                      borderTop:`1px solid ${C.border}`,
                      fontSize:13, color:C.text3, cursor:"pointer",
                      transition:"all .2s", fontFamily:"inherit",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
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
            /* Not logged in */
            <div style={{ display:"flex", gap:10 }}>
              <Link href="/login" style={{
                padding:"9px 18px", borderRadius:10, textDecoration:"none",
                border:`1.5px solid ${C.border}`, color:C.text2,
                fontSize:13, fontWeight:600, transition:"all .2s",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor=C.goldBdr; e.currentTarget.style.color=C.gold; }}
                onMouseOut={e  => { e.currentTarget.style.borderColor=C.border;   e.currentTarget.style.color=C.text2; }}>
                Sign In
              </Link>
              <Link href="/register" style={{
                padding:"9px 18px", borderRadius:10, textDecoration:"none",
                background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                color:"#1A1008", fontSize:13, fontWeight:700,
                boxShadow:"0 2px 10px rgba(232,201,122,.25)",
              }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}