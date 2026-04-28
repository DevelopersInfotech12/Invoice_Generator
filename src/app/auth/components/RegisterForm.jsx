"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useRouter } from "next/navigation";
import GoogleButton from "./GoogleButton.jsx";
import Link from "next/link";

const C = {
  bg:      "var(--background)",
  surface: "var(--inv-surface)",
  border:  "var(--inv-border)",
  text1:   "var(--inv-text1)",
  text2:   "var(--inv-text2)",
  text3:   "var(--inv-text3)",
  text4:   "var(--inv-text4)",
  gold:    "#E8C97A",
  red:     "#F87171",
  green:   "#34D399",
};

function FloatInput({ label, type = "text", value, onChange, error, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value !== "";
  return (
    <div style={{ position: "relative", marginBottom: error ? 4 : 16 }}>
      <input
        type={type} value={value} onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: focused ? "var(--inv-surface-hover)" : C.surface,
          border: `1.5px solid ${error ? C.red : focused ? C.gold : C.border}`,
          borderRadius: 12,
          padding: active ? "20px 14px 6px" : "13px 14px",
          paddingRight: rightSlot ? 50 : 14,
          fontSize: 14, color: C.text1,
          fontFamily: "'DM Sans',sans-serif", outline: "none",
          transition: "border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px rgba(232,201,122,0.12)" : "none",
        }}
      />
      <label style={{
        position: "absolute", left: 14, pointerEvents: "none",
        top: active ? 6 : "50%", transform: active ? "none" : "translateY(-50%)",
        fontSize: active ? 9 : 14, fontWeight: active ? 700 : 400,
        color: error ? C.red : focused ? C.gold : (active ? C.text3 : C.text4),
        letterSpacing: active ? ".07em" : "normal",
        textTransform: active ? "uppercase" : "none",
        transition: "all .2s cubic-bezier(0.4,0,0.2,1)",
      }}>{label}</label>
      {rightSlot && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const col = ["", "#F87171", "#FBBF24", "#60A5FA", "#34D399"][score];
  const lbl = ["", "Weak", "Fair", "Good", "Strong"][score];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 4,
            background: i <= score ? col : "var(--inv-border)",
            transition: "background .3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: col, letterSpacing: ".06em" }}>
        {lbl}
      </span>
    </div>
  );
}

export default function RegisterForm({ redirectTo = "/" }) {
  const { register } = useAuth();
  const router       = useRouter();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setApiErr("");
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Minimum 8 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiErr("");
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1400);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  const showHideBtn = (
    <button type="button"
      onClick={() => setShowPw(p => !p)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 10, color: C.text4, fontWeight: 800,
        fontFamily: "inherit", letterSpacing: ".07em",
        transition: "color .2s", padding: 0,
      }}
      onMouseOver={e => e.currentTarget.style.color = C.gold}
      onMouseOut={e => e.currentTarget.style.color = C.text4}
    >
      {showPw ? "HIDE" : "SHOW"}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      backgroundImage: `
        radial-gradient(ellipse 70% 45% at 15% -5%, rgba(232,201,122,.07) 0%, transparent 60%),
        radial-gradient(ellipse 55% 40% at 85% 105%, rgba(147,51,234,.05) 0%, transparent 55%)
      `,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'DM Sans',sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');

        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes lglow   { 0%,100% { box-shadow:0 4px 22px rgba(232,201,122,.28) } 50% { box-shadow:0 4px 32px rgba(232,201,122,.52) } }
        @keyframes checkIn { from { opacity:0; transform:scale(.5) } to { opacity:1; transform:scale(1) } }

        .rbtn:hover:not(:disabled) {
          background: linear-gradient(135deg,#F0D880,#C89A30) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(232,201,122,.45) !important;
        }
        .rbtn:disabled { opacity:.65; cursor:not-allowed; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp .45s ease both" }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 15, margin: "0 auto 16px",
            background: "linear-gradient(135deg,#E8C97A,#B8913A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "lglow 3.5s ease infinite",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A1008" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="9" y1="7" x2="15" y2="7" />
              <line x1="9" y1="11" x2="15" y2="11" />
              <line x1="9" y1="15" x2="12" y2="15" />
            </svg>
          </div>
          <h1 style={{
            margin: 0, fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(1.6rem,5vw,1.9rem)", fontWeight: 400,
            color: C.text1, letterSpacing: "-.01em", lineHeight: 1.1,
          }}>
            Create account
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: C.text3 }}>
            Start generating professional GST invoices
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 8px 40px rgba(0,0,0,.12)",
        }}>

          {success ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(52,211,153,.12)",
                border: "2px solid rgba(52,211,153,.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                animation: "checkIn .4s ease both",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="#34D399" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ color: C.green, fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>
                Account created!
              </p>
              <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>
                Redirecting you now…
              </p>
            </div>
          ) : (
            <>
              <GoogleButton redirectTo={redirectTo} />

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.text4, fontWeight: 700, letterSpacing: ".1em" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <form onSubmit={handleSubmit} noValidate>

                <FloatInput label="Full Name" value={form.name}
                  onChange={e => set("name", e.target.value)}
                  error={errors.name} autoComplete="name" />
                {errors.name && (
                  <p style={{ fontSize: 11, color: C.red, margin: "-10px 0 12px 2px", fontWeight: 600 }}>
                    {errors.name}
                  </p>
                )}

                <FloatInput label="Email address" type="email" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  error={errors.email} autoComplete="email" />
                {errors.email && (
                  <p style={{ fontSize: 11, color: C.red, margin: "-10px 0 12px 2px", fontWeight: 600 }}>
                    {errors.email}
                  </p>
                )}

                <FloatInput label="Password" type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => set("password", e.target.value)}
                  error={errors.password} autoComplete="new-password"
                  rightSlot={showHideBtn} />
                {errors.password && (
                  <p style={{ fontSize: 11, color: C.red, margin: "-10px 0 8px 2px", fontWeight: 600 }}>
                    {errors.password}
                  </p>
                )}
                <StrengthBar password={form.password} />

                <FloatInput label="Confirm Password" type={showPw ? "text" : "password"} value={form.confirm}
                  onChange={e => set("confirm", e.target.value)}
                  error={errors.confirm} autoComplete="new-password" />
                {errors.confirm && (
                  <p style={{ fontSize: 11, color: C.red, margin: "-10px 0 14px 2px", fontWeight: 600 }}>
                    {errors.confirm}
                  </p>
                )}

                {apiErr && (
                  <div style={{
                    background: "rgba(248,113,113,.08)",
                    border: "1px solid rgba(248,113,113,.25)",
                    borderRadius: 10, padding: "11px 14px", marginBottom: 18,
                    fontSize: 13, color: C.red, textAlign: "center", fontWeight: 500,
                  }}>
                    {apiErr}
                  </div>
                )}

                <p style={{ fontSize: 11, color: C.text4, textAlign: "center", marginBottom: 18, lineHeight: 1.7 }}>
                  By registering you agree to our{" "}
                  <Link href="/terms" style={{ color: C.text3, textDecoration: "underline" }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" style={{ color: C.text3, textDecoration: "underline" }}>Privacy Policy</Link>.
                </p>

                <button type="submit" className="rbtn" disabled={loading}
                  style={{
                    width: "100%", padding: "14px",
                    background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                    border: "none", borderRadius: 12, color: "#1A1008",
                    fontSize: 14, fontWeight: 800, cursor: "pointer",
                    fontFamily: "inherit", letterSpacing: ".02em",
                    boxShadow: "0 4px 18px rgba(232,201,122,.28)",
                    transition: "all .2s",
                  }}>
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: C.text3 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: C.gold, fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}