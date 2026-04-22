"use client";
// frontend/src/auth/components/LoginForm.jsx
import { useState }    from "react";
import { useAuth }     from "../hooks/useAuth.js";
import { useRouter }   from "next/navigation";
import GoogleButton    from "./GoogleButton.jsx";
import Link            from "next/link";

/* ── Design tokens ── */
const C = {
  bg:"#0E0C09", surface:"rgba(255,255,255,0.04)",
  border:"rgba(255,255,255,0.10)", gold:"#E8C97A",
  white:"#FFFFFF", text1:"#F5F2EC", text2:"#D4CEC5",
  text3:"#9A9080", text4:"#5A5347", red:"#F87171", green:"#34D399",
};

/* ── Reusable floating label input ── */
function FloatInput({ label, type="text", value, onChange, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value !== "";
  return (
    <div style={{ position:"relative", marginBottom: error ? 4 : 18 }}>
      <input
        type={type} value={value} onChange={onChange}
        autoComplete={autoComplete}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box",
          background: focused?"rgba(255,255,255,0.07)":C.surface,
          border:`1.5px solid ${error?C.red:focused?C.gold:C.border}`,
          borderRadius:12,
          padding: active?"20px 14px 6px":"13px 14px",
          fontSize:14, color:C.text1,
          fontFamily:"'DM Sans',sans-serif", outline:"none",
          transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused?"0 0 0 3px rgba(232,201,122,0.12)":"none",
        }}
      />
      <label style={{
        position:"absolute", left:14, pointerEvents:"none",
        top: active?6:"50%", transform: active?"none":"translateY(-50%)",
        fontSize: active?9:14, fontWeight: active?700:400,
        color: error?C.red:focused?C.gold:(active?C.text3:C.text4),
        letterSpacing: active?".07em":"normal",
        textTransform: active?"uppercase":"none",
        transition:"all .2s cubic-bezier(0.4,0,0.2,1)",
      }}>{label}</label>
    </div>
  );
}

export default function LoginForm({ redirectTo = "/" }) {
  const { login } = useAuth();
  const router    = useRouter();

  const [form,    setForm]    = useState({ email:"", password:"" });
  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k,v) => {
    setForm(f=>({...f,[k]:v}));
    setErrors(e=>({...e,[k]:""}));
    setApiErr("");
  };

  function validate() {
    const e = {};
    if (!form.email)    e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiErr("");
    try {
      await login({ email:form.email, password:form.password });
      router.push(redirectTo);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      backgroundImage:`
        radial-gradient(ellipse 70% 45% at 15% -5%,rgba(232,201,122,.07) 0%,transparent 60%),
        radial-gradient(ellipse 55% 40% at 85% 105%,rgba(147,51,234,.05) 0%,transparent 55%)
      `,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"24px 16px", fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lglow{0%,100%{box-shadow:0 4px 22px rgba(232,201,122,.28)}50%{box-shadow:0 4px 32px rgba(232,201,122,.52)}}
        .lbtn:hover:not(:disabled){background:linear-gradient(135deg,#F0D880,#C89A30)!important;transform:translateY(-1px);box-shadow:0 8px 28px rgba(232,201,122,.45)!important}
        .lbtn:disabled{opacity:.65;cursor:not-allowed}
        .ltog:hover{color:#E8C97A!important}
        .llink:hover{color:#E8C97A!important}
      `}</style>

      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp .45s ease both" }}>

        {/* ── Logo ── */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:54, height:54, borderRadius:15, margin:"0 auto 16px",
            background:"linear-gradient(135deg,#E8C97A,#B8913A)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"lglow 3.5s ease infinite",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A1008" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="9" y1="7" x2="15" y2="7"/>
              <line x1="9" y1="11" x2="15" y2="11"/>
              <line x1="9" y1="15" x2="12" y2="15"/>
            </svg>
          </div>
          <h1 style={{
            margin:0, fontFamily:"'DM Serif Display',serif",
            fontSize:"clamp(1.6rem,5vw,1.9rem)", fontWeight:400,
            color:C.white, letterSpacing:"-.01em", lineHeight:1.1,
          }}>
            Welcome back
          </h1>
          <p style={{ margin:"8px 0 0", fontSize:13, color:C.text3 }}>
            Sign in to your Invoice Generator account
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:20, padding:"32px 28px",
          boxShadow:"0 8px 40px rgba(0,0,0,.5)",
        }}>

          {/* Google button */}
          <GoogleButton redirectTo={redirectTo}/>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }}/>
            <span style={{ fontSize:11, color:C.text4, fontWeight:700, letterSpacing:".1em" }}>
              OR
            </span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            <FloatInput
              label="Email address" type="email"
              value={form.email} onChange={e=>set("email",e.target.value)}
              error={errors.email} autoComplete="email"
            />
            {errors.email && (
              <p style={{ fontSize:11, color:C.red, margin:"-12px 0 14px 2px", fontWeight:600 }}>
                {errors.email}
              </p>
            )}

            {/* Password row */}
            <div style={{ position:"relative" }}>
              <FloatInput
                label="Password" type={showPw?"text":"password"}
                value={form.password} onChange={e=>set("password",e.target.value)}
                error={errors.password} autoComplete="current-password"
              />
              <button type="button" className="ltog"
                onClick={()=>setShowPw(p=>!p)}
                style={{
                  position:"absolute", right:14,
                  top: errors.password ? "38%" : "50%",
                  transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:10, color:C.text4, fontWeight:800,
                  fontFamily:"inherit", letterSpacing:".07em",
                  transition:"color .2s",
                }}>
                {showPw?"HIDE":"SHOW"}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize:11, color:C.red, margin:"-12px 0 14px 2px", fontWeight:600 }}>
                {errors.password}
              </p>
            )}

            {/* Forgot password */}
            <div style={{ textAlign:"right", marginBottom:22 }}>
              <Link href="/forgot-password" className="llink"
                style={{ fontSize:12, color:C.text3, textDecoration:"none", transition:"color .2s" }}>
                Forgot password?
              </Link>
            </div>

            {/* API error */}
            {apiErr && (
              <div style={{
                background:"rgba(248,113,113,.08)",
                border:"1px solid rgba(248,113,113,.25)",
                borderRadius:10, padding:"11px 14px", marginBottom:18,
                fontSize:13, color:C.red, textAlign:"center", fontWeight:500,
              }}>
                {apiErr}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="lbtn" disabled={loading}
              style={{
                width:"100%", padding:"14px",
                background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                border:"none", borderRadius:12, color:"#1A1008",
                fontSize:14, fontWeight:800, cursor:"pointer",
                fontFamily:"inherit", letterSpacing:".02em",
                boxShadow:"0 4px 18px rgba(232,201,122,.28)",
                transition:"all .2s",
              }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign:"center", marginTop:22, fontSize:13, color:C.text3 }}>
          Don&apos;t have an account?{" "}
          <Link href="/register"
            style={{ color:C.gold, fontWeight:700, textDecoration:"none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}