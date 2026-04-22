"use client";

import { useState } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import AuthGuard from "../auth/components/AuthGuard";
import { authApi } from "../auth/api/authApi";
import { useRouter } from "next/navigation";

const C = {
  bg:      "#0E0C09",
  surface: "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.10)",
  gold:    "#E8C97A",
  goldBg:  "rgba(232,201,122,0.10)",
  goldBdr: "rgba(232,201,122,0.30)",
  white:   "#FFFFFF",
  text1:   "#F5F2EC",
  text2:   "#D4CEC5",
  text3:   "#9A9080",
  text4:   "#5A5347",
  red:     "#F87171",
  green:   "#34D399",
};

function FloatInput({ label, type = "text", value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value !== "" && value !== undefined);
  return (
    <div style={{ position: "relative", marginBottom: 18 }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: disabled ? "rgba(255,255,255,0.02)" : focused ? "rgba(255,255,255,0.07)" : C.surface,
          border: `1.5px solid ${focused ? C.gold : C.border}`,
          borderRadius: 12,
          padding: active ? "20px 14px 6px" : "13px 14px",
          fontSize: 14, color: disabled ? C.text4 : C.text1,
          fontFamily: "'DM Sans',sans-serif", outline: "none",
          transition: "border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px rgba(232,201,122,0.12)" : "none",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      <label style={{
        position: "absolute", left: 14, pointerEvents: "none",
        top: active ? 6 : "50%",
        transform: active ? "none" : "translateY(-50%)",
        fontSize: active ? 9 : 14,
        fontWeight: active ? 700 : 400,
        color: focused ? C.gold : (active ? C.text3 : C.text4),
        letterSpacing: active ? ".07em" : "normal",
        textTransform: active ? "uppercase" : "none",
        transition: "all .2s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {label}
      </label>
    </div>
  );
}

function GoldBtn({ children, onClick, loading, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 28px",
        background: loading ? "rgba(232,201,122,.5)" : "linear-gradient(135deg,#E8C97A,#B8913A)",
        border: "none", borderRadius: 12, color: "#1A1008",
        fontSize: 13, fontWeight: 800,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans',sans-serif",
        boxShadow: "0 4px 18px rgba(232,201,122,.25)",
        transition: "all .2s",
      }}
    >
      {children}
    </button>
  );
}

function StatusBox({ msg }) {
  if (!msg.text) return null;
  return (
    <div style={{
      background: msg.ok ? "rgba(52,211,153,.08)" : "rgba(248,113,113,.08)",
      border: `1px solid ${msg.ok ? "rgba(52,211,153,.3)" : "rgba(248,113,113,.3)"}`,
      borderRadius: 10, padding: "10px 14px", marginBottom: 16,
      fontSize: 13, color: msg.ok ? C.green : C.red, textAlign: "center",
    }}>
      {msg.text}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [name,     setName]     = useState(user?.name || "");
  const [profMsg,  setProfMsg]  = useState({ text: "", ok: true });
  const [profLoad, setProfLoad] = useState(false);

  const [curPw,    setCurPw]    = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confPw,   setConfPw]   = useState("");
  const [pwMsg,    setPwMsg]    = useState({ text: "", ok: true });
  const [pwLoad,   setPwLoad]   = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!name.trim()) { setProfMsg({ text: "Name cannot be empty.", ok: false }); return; }
    setProfLoad(true); setProfMsg({ text: "", ok: true });
    try {
      await updateProfile({ name: name.trim() });
      setProfMsg({ text: "Profile updated successfully.", ok: true });
    } catch (err) {
      setProfMsg({ text: err.message, ok: false });
    } finally {
      setProfLoad(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!curPw || !newPw || !confPw) { setPwMsg({ text: "All fields are required.", ok: false }); return; }
    if (newPw.length < 8)            { setPwMsg({ text: "Minimum 8 characters.", ok: false }); return; }
    if (newPw !== confPw)            { setPwMsg({ text: "Passwords do not match.", ok: false }); return; }
    setPwLoad(true); setPwMsg({ text: "", ok: true });
    try {
      await authApi.changePassword({ currentPassword: curPw, newPassword: newPw });
      setPwMsg({ text: "Password changed successfully.", ok: true });
      setCurPw(""); setNewPw(""); setConfPw("");
    } catch (err) {
      setPwMsg({ text: err.message, ok: false });
    } finally {
      setPwLoad(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const card = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "28px 28px",
    marginBottom: 20,
  };

  const sectionTitle = {
    margin: "0 0 20px",
    fontSize: 13, fontWeight: 800,
    color: C.gold,
    textTransform: "uppercase",
    letterSpacing: ".1em",
  };

  return (
    <AuthGuard redirectTo="/login">
      <div style={{
        minHeight: "100vh", background: C.bg,
        backgroundImage: `
          radial-gradient(ellipse 70% 45% at 15% -5%,rgba(232,201,122,.06) 0%,transparent 60%),
          radial-gradient(ellipse 55% 40% at 85% 105%,rgba(147,51,234,.04) 0%,transparent 55%)
        `,
        padding: "40px 20px 80px",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          .gbtn:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 8px 28px rgba(232,201,122,.45)!important; }
          .rbtn:hover{ background:rgba(248,113,113,.14)!important; border-color:rgba(248,113,113,.4)!important; color:#F87171!important; }
        `}</style>

        <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp .4s ease both" }}>

          {/* ── Title ── */}
          <h1 style={{
            margin: "0 0 32px",
            fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(1.5rem,4vw,2rem)",
            fontWeight: 400, color: C.white, letterSpacing: "-.01em",
          }}>
            My Profile
          </h1>

          {/* ── Avatar card ── */}
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#E8C97A,#B8913A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#1A1008",
              boxShadow: "0 4px 20px rgba(232,201,122,.3)",
              overflow: "hidden",
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user?.name}
                    style={{ width: 72, height: 72, objectFit: "cover" }} />
                : initials
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text1 }}>
                {user?.name}
              </p>
              <p style={{ margin: "3px 0 6px", fontSize: 13, color: C.text3 }}>
                {user?.email}
              </p>
              <span style={{
                display: "inline-block",
                background: C.goldBg, border: `1px solid ${C.goldBdr}`,
                color: C.gold, fontSize: 10, fontWeight: 800,
                padding: "3px 12px", borderRadius: 20,
                letterSpacing: ".1em", textTransform: "uppercase",
              }}>
                {user?.provider === "google" ? "Google Account" : "Email Account"}
              </span>
            </div>
          </div>

          {/* ── Edit profile ── */}
          <div style={card}>
            <h2 style={sectionTitle}>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <FloatInput label="Full Name" value={name}
                onChange={e => setName(e.target.value)} />
              <FloatInput label="Email address" value={user?.email || ""} disabled />
              <p style={{ fontSize: 11, color: C.text4, margin: "-10px 0 20px" }}>
                Email cannot be changed.
              </p>
              <StatusBox msg={profMsg} />
              <GoldBtn type="submit" loading={profLoad}>
                {profLoad ? "Saving…" : "Save Changes"}
              </GoldBtn>
            </form>
          </div>

          {/* ── Change password (email users only) ── */}
          {user?.provider !== "google" && (
            <div style={card}>
              <h2 style={sectionTitle}>Change Password</h2>
              <form onSubmit={handlePasswordSave}>
                <FloatInput label="Current Password" type="password"
                  value={curPw} onChange={e => setCurPw(e.target.value)} />
                <FloatInput label="New Password" type="password"
                  value={newPw} onChange={e => setNewPw(e.target.value)} />
                <FloatInput label="Confirm New Password" type="password"
                  value={confPw} onChange={e => setConfPw(e.target.value)} />
                <StatusBox msg={pwMsg} />
                <GoldBtn type="submit" loading={pwLoad}>
                  {pwLoad ? "Updating…" : "Update Password"}
                </GoldBtn>
              </form>
            </div>
          )}

          {/* ── Sign out ── */}
          <div style={{ ...card, border: "1px solid rgba(248,113,113,.2)", marginBottom: 0 }}>
            <h2 style={{ ...sectionTitle, color: C.red }}>Sign Out</h2>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: C.text3 }}>
              You will be redirected to the login page.
            </p>
            <button className="rbtn" onClick={handleLogout}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 24px", borderRadius: 12, cursor: "pointer",
                border: "1.5px solid rgba(248,113,113,.2)",
                background: "rgba(248,113,113,.06)",
                color: C.text2, fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", transition: "all .2s",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}