// src/app/components/InvoiceUIComponents.jsx
"use client";
import { useState, useRef, useEffect } from "react";

export const T = {
  surface: "var(--inv-surface)", border: "var(--inv-border)",
  text1: "var(--inv-text1)", text2: "var(--inv-text2)",
  text3: "var(--inv-text3)", text4: "var(--inv-text4)",
  accent: "#2563EB", accentLt: "rgba(37,99,235,0.08)", accentBd: "rgba(37,99,235,0.25)",
  danger: "#DC2626", success: "#16A34A",
  successLt: "rgba(22,163,74,0.08)", successBd: "rgba(22,163,74,0.30)",
};

export function Input({ label, value, onChange, type="text", mono=false, maxLength, readOnly=false, style={} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, ...style }}>
      {label && <label style={{ fontSize:11, fontWeight:600, color:T.text3, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} maxLength={maxLength} readOnly={readOnly}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box",
          background: readOnly ? "var(--inv-surface-hover)" : T.surface,
          border:`1px solid ${focused ? T.accent : T.border}`,
          borderRadius:6, padding:"9px 11px", fontSize:13.5, color:T.text1,
          fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : "inherit",
          outline:"none", transition:"border-color .15s, box-shadow .15s",
          boxShadow: focused ? `0 0 0 3px ${T.accentLt}` : "none",
          letterSpacing: mono ? ".04em" : "normal",
        }}
      />
    </div>
  );
}

export function Textarea({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, fontWeight:600, color:T.text3, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>}
      <textarea value={value} onChange={onChange}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box", minHeight:110, resize:"vertical",
          background:T.surface, border:`1px solid ${focused ? T.accent : T.border}`,
          borderRadius:6, padding:"9px 11px", fontSize:13, color:T.text1,
          lineHeight:1.65, fontFamily:"inherit", outline:"none",
          transition:"border-color .15s, box-shadow .15s",
          boxShadow: focused ? `0 0 0 3px ${T.accentLt}` : "none",
        }}
      />
    </div>
  );
}

export function AnimNum({ value, prefix="₹", dec=2 }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(()=>{
    if(prev.current===value) return;
    const s=prev.current, e=value, dur=320, t0=performance.now();
    const tick=now=>{
      const p=Math.min((now-t0)/dur,1), ep=p<.5?2*p*p:-1+(4-2*p)*p;
      setDisp(s+(e-s)*ep);
      if(p<1) requestAnimationFrame(tick); else { setDisp(e); prev.current=e; }
    };
    requestAnimationFrame(tick);
  },[value]);
  return <span>{prefix}{disp.toFixed(dec)}</span>;
}

export function Spinner({ color="#fff" }) {
  return <span style={{ display:"inline-block", width:13, height:13, border:`2px solid ${color}33`, borderTopColor:color, borderRadius:"50%", animation:"inv-spin .7s linear infinite" }}/>;
}

export function SectionLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:".1em", paddingBottom:12, marginBottom:16, borderBottom:`1px solid ${T.border}` }}>{children}</div>;
}

export function Card({ children, style={} }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"20px 22px", ...style }}>{children}</div>;
}

export function Badge({ children, color=T.accent }) {
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:4, fontSize:11, fontWeight:700, background:`${color}14`, color, border:`1px solid ${color}30`, letterSpacing:".05em", textTransform:"uppercase" }}>{children}</span>;
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:20, left:"50%", zIndex:9999, transform:"translateX(-50%)",
      animation:"inv-slidedown .25s ease both",
      display:"flex", alignItems:"center", gap:10,
      background: toast.ok ? "#f0fdf4" : "#fef2f2",
      border:`1px solid ${toast.ok ? "#bbf7d0" : "#fecaca"}`,
      borderRadius:6, padding:"10px 18px",
      color: toast.ok ? "#15803d" : "#b91c1c",
      fontSize:13, fontWeight:600,
      boxShadow:"0 4px 20px rgba(0,0,0,0.10)",
    }}>
      <span>{toast.ok ? "✓" : "✕"}</span>{toast.msg}
    </div>
  );
}

export function FetchGSTBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display:"inline-flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:6,
      cursor:loading?"not-allowed":"pointer", background:T.accent, border:"none", color:"#fff",
      fontSize:12, fontWeight:600, opacity:loading?0.7:1, whiteSpace:"nowrap",
      transition:"opacity .15s", flexShrink:0,
    }}>
      {loading ? <><Spinner/>Fetching…</> : <>⚡ Fetch GST</>}
    </button>
  );
}

export function PartySection({ title, gstin, onGstinChange, onFetch, loading, error, fields, values, onChange, onClear }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:0 }}>
        <SectionLabel>{title}</SectionLabel>
        {onClear && (
          <button onClick={onClear} title={`Clear ${title}`} style={{
            display:"inline-flex", alignItems:"center", gap:4,
            padding:"3px 10px", marginBottom:6, borderRadius:5, cursor:"pointer",
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.text4, fontSize:11, fontWeight:600, fontFamily:"inherit",
            transition:"all .15s", flexShrink:0,
          }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor="#DC2626"; e.currentTarget.style.color="#DC2626"; }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text4; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            Clear
          </button>
        )}
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, fontWeight:600, color:T.text3, textTransform:"uppercase", letterSpacing:".06em", display:"block", marginBottom:5 }}>GSTIN / UIN</label>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
          <input value={gstin} onChange={onGstinChange} maxLength={15} placeholder="Enter 15-digit GSTIN"
            style={{ flex:1, boxSizing:"border-box", background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:"9px 11px", fontSize:13, color:T.text1, fontFamily:"'JetBrains Mono','Courier New',monospace", letterSpacing:".05em", outline:"none" }}
          />
          <FetchGSTBtn onClick={onFetch} loading={loading}/>
        </div>
        {error && <p style={{ margin:"5px 0 0", fontSize:12, color:T.danger, fontWeight:500 }}>{error}</p>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {fields.map(({ label, key, mono, fullWidth })=>(
          <div key={key} style={fullWidth?{gridColumn:"1/-1"}:{}}>
            <Input label={label} value={values[key]||""} mono={mono}
              onChange={e=>onChange(key, key==="pan"?e.target.value.toUpperCase():e.target.value)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrollShadow({ children }) {
  const scrollRef=useRef(null);
  const [showLeft,setShowLeft]=useState(false);
  const [showRight,setShowRight]=useState(false);
  const [hasScrolled,setHasScrolled]=useState(false);
  const update=()=>{
    const el=scrollRef.current; if(!el) return;
    setShowLeft(el.scrollLeft>4);
    setShowRight(el.scrollLeft<el.scrollWidth-el.clientWidth-4);
    if(el.scrollLeft>4) setHasScrolled(true);
  };
  useEffect(()=>{
    update();
    const el=scrollRef.current; if(!el) return;
    el.addEventListener("scroll",update,{passive:true});
    const ro=new ResizeObserver(update); ro.observe(el);
    return()=>{ el.removeEventListener("scroll",update); ro.disconnect(); };
  },[]);
  const fade=(dir)=>({
    position:"absolute", [dir==="left"?"left":"right"]:0, top:0, bottom:0, width:56,
    pointerEvents:"none", zIndex:3,
    borderRadius:dir==="left"?"8px 0 0 8px":"0 8px 8px 0",
    background:`linear-gradient(to ${dir==="left"?"right":"left"}, var(--inv-surface,#fff) 0%, transparent 100%)`,
    opacity:dir==="left"?(showLeft?1:0):(showRight?1:0),
    transition:"opacity .2s ease",
  });
  return (
    <div style={{ position:"relative" }}>
      <div style={fade("left")}/>
      <div ref={scrollRef} className="inv-scroll-area-custom"
        style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"thin", scrollbarColor:"#4B5563 transparent" }}>
        <div style={{ minWidth:820 }}>{children}</div>
      </div>
      <div style={fade("right")}/>
      {!hasScrolled&&showRight&&(
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:7, pointerEvents:"none" }}>
          <span style={{ fontSize:11, color:"var(--inv-text4)", fontStyle:"italic" }}>← Scroll to see more columns</span>
        </div>
      )}
    </div>
  );
}

export function CustomSelect({ label, value, onChange, options, wrapperClassName="" }) {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div className={wrapperClassName} style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label&&<label style={{ fontSize:11, fontWeight:600, color:T.text3, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>}
      <div ref={ref} style={{ position:"relative", width:"100%" }}>
        <div onClick={()=>setOpen(o=>!o)} style={{
          width:"100%", boxSizing:"border-box", background:T.surface,
          border:`1px solid ${open?T.accent:T.border}`, borderRadius:6,
          padding:"9px 32px 9px 11px", fontSize:13.5, color:T.text1,
          cursor:"pointer", userSelect:"none", position:"relative",
          boxShadow:open?`0 0 0 3px ${T.accentLt}`:"none", transition:"border-color .15s, box-shadow .15s",
        }}>
          {value||"Select type"}
          <span style={{ position:"absolute", right:10, top:"50%", transform:`translateY(-50%) rotate(${open?180:0}deg)`, transition:"transform .2s", pointerEvents:"none", fontSize:16, color:T.text3 }}>▾</span>
        </div>
        {open&&(
          <div style={{ position:"absolute", top:"100%", left:0, right:0, boxSizing:"border-box", background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, zIndex:999, marginTop:4, boxShadow:"0 4px 16px rgba(0,0,0,0.12)", overflow:"hidden" }}>
            {options.map(opt=>(
              <div key={opt} onClick={()=>{ onChange(opt); setOpen(false); }}
                style={{ padding:"9px 12px", fontSize:13.5, color:opt===value?T.accent:T.text1, background:opt===value?T.accentLt:"transparent", cursor:"pointer", fontWeight:opt===value?600:400 }}
                onMouseEnter={e=>e.currentTarget.style.background=opt===value?T.accentLt:"var(--inv-surface-hover)"}
                onMouseLeave={e=>e.currentTarget.style.background=opt===value?T.accentLt:"transparent"}
              >{opt}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"var(--inv-bg)", border:`1px solid ${T.border}`, borderRadius:10, padding:"32px 28px", maxWidth:360, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.25)", animation:"inv-fadeup .25s ease both" }}>
        <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:600, color:T.text1 }}>Save Invoice</h3>
        <p style={{ margin:"0 0 22px", fontSize:13, color:T.text3, lineHeight:1.6 }}>Sign in or create a free account to save and manage your invoices.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <a href="/login" style={{ display:"block", padding:"11px", background:T.accent, borderRadius:6, color:"#fff", fontSize:13, fontWeight:600, textAlign:"center", textDecoration:"none" }}>Sign In</a>
          <a href="/register" style={{ display:"block", padding:"11px", background:"transparent", border:`1px solid ${T.border}`, borderRadius:6, color:T.text2, fontSize:13, fontWeight:500, textAlign:"center", textDecoration:"none" }}>Create Free Account</a>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:T.text4, fontFamily:"inherit", padding:"6px" }}>Continue without saving</button>
        </div>
      </div>
    </div>
  );
}