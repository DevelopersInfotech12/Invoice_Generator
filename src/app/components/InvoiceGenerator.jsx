"use client";
import React, { useState, useRef, useEffect } from "react";
import InvoicePrint from "./InvoicePrint";
import { invoiceApi } from "../auth/api/authApi";
import { useAuth } from "../auth/hooks/useAuth";

const API_KEY  = "0563aa1121mshac8e837fdc8b3c9p1838c5jsnd2139ed3c4e2";
const API_HOST = "gst-insights-api.p.rapidapi.com";

const defaultInvoice = {
  invoiceNumber:"", date:new Date().toISOString().split("T")[0], suppliersRef:"",
  buyerOrderNo:"", dispatchDocNo:"", dispatchedThrough:"", termsOfDelivery:"",
  from:{ name:"", address:"", city:"", state:"", zipCode:"", stateCode:"", gstin:"", pan:"" },
  to:  { name:"", address:"", city:"", state:"", zipCode:"", gstin:"" },
  items:[{ description:"", hsn:"", quantity:1, rate:0, per:"Nos", amount:0 }],
  tax:18, taxType:"cgst_sgst",
  notes:"We declare that this Invoice shows the actual price of the goods described and that all particulars are true and correct.",
  bank:{ bankName:"", accountHolder:"", accountNumber:"", confirmAccountNumber:"", ifsc:"", accountType:"Current", branch:"" },
};

const C = {
  bg:"#0E0C09", surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.10)",
  gold:"#E8C97A", goldDim:"#A8874A", goldBg:"rgba(232,201,122,0.10)",
  goldBdr:"rgba(232,201,122,0.30)", white:"#FFFFFF", text1:"#F5F2EC",
  text2:"#D4CEC5", text3:"#9A9080", text4:"#5A5347", blue:"#60A5FA",
  purple:"#C084FC", green:"#34D399", red:"#F87171",
};

/* ── Floating Label Input ── */
function FloatInput({ label, value, onChange, type="text", mono=false, maxLength, style={} }) {
  const [focused, setFocused] = useState(false);
  const filled  = value !== "" && value !== undefined && value !== null;
  const active  = focused || filled;
  const hasLabel = !!label;
  return (
    <div style={{ position:"relative", ...style }}>
      <input
        type={type} value={value} onChange={onChange} maxLength={maxLength}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box",
          background: focused ? "rgba(255,255,255,0.07)" : C.surface,
          border:`1.5px solid ${focused ? C.gold : C.border}`,
          borderRadius:12,
          padding: hasLabel ? (active ? "20px 14px 6px" : "13px 14px") : "13px 14px",
          fontSize:14, color:C.text1,
          fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : "inherit",
          outline:"none", letterSpacing: mono ? ".05em" : "normal",
          transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px rgba(232,201,122,0.12)" : "none",
        }}
      />
      {hasLabel && (
        <label style={{
          position:"absolute", left:14, pointerEvents:"none",
          top: active ? 6 : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? 9 : 14, fontWeight: active ? 700 : 400,
          color: focused ? C.gold : (active ? C.text3 : C.text4),
          letterSpacing: active ? ".07em" : "normal",
          textTransform: active ? "uppercase" : "none",
          transition:"all .2s cubic-bezier(0.4,0,0.2,1)",
        }}>{label}</label>
      )}
    </div>
  );
}

/* ── Floating Label Textarea ── */
function FloatTextarea({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <textarea value={value} onChange={onChange}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box", minHeight:130, resize:"vertical",
          background: focused ? "rgba(255,255,255,0.07)" : C.surface,
          border:`1.5px solid ${focused ? C.gold : C.border}`,
          borderRadius:12, padding:"26px 14px 12px",
          fontSize:13, color:C.text1, lineHeight:1.7,
          fontFamily:"inherit", outline:"none",
          transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px rgba(232,201,122,0.12)" : "none",
        }}/>
      <label style={{
        position:"absolute", left:14, top:8, pointerEvents:"none",
        fontSize:9, fontWeight:700,
        color: focused ? C.gold : C.text3,
        letterSpacing:".07em", textTransform:"uppercase",
        transition:"color .2s",
      }}>{label}</label>
    </div>
  );
}

/* ── Animated number counter ── */
function AnimNum({ value, prefix="₹", dec=2 }) {
  const [disp,setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(()=>{
    if(prev.current===value) return;
    const s=prev.current, e=value, dur=380, t0=performance.now();
    const tick=now=>{
      const p=Math.min((now-t0)/dur,1), ep=p<.5?2*p*p:-1+(4-2*p)*p;
      setDisp(s+(e-s)*ep);
      if(p<1) requestAnimationFrame(tick); else { setDisp(e); prev.current=e; }
    };
    requestAnimationFrame(tick);
  },[value]);
  return <span>{prefix}{disp.toFixed(dec)}</span>;
}

/* ── Scroll reveal ── */
function Section({ children, delay=0 }) {
  const ref=useRef(); const [vis,setVis]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true); },{threshold:.05});
    if(ref.current) obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  return (
    <div ref={ref} style={{
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(20px)",
      transition:`opacity .5s ease ${delay}s, transform .5s ease ${delay}s`,
    }}>{children}</div>
  );
}

/* ── Section heading ── */
function SHD({ icon, label, accent }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <span style={{fontSize:15}}>{icon}</span>
      <span style={{ fontSize:11, fontWeight:800, color:accent||C.gold,
        textTransform:"uppercase", letterSpacing:".12em" }}>{label}</span>
      <div style={{flex:1, height:1, background:`linear-gradient(90deg,${accent||C.gold}30,transparent)`}}/>
    </div>
  );
}

/* ── Card ── */
function Card({ children, accent, style={} }) {
  return (
    <div style={{
      background: C.surface,
      border:`1px solid ${accent ? `${accent}30` : C.border}`,
      borderRadius:20, padding:"24px 24px",
      position:"relative", overflow:"hidden", ...style,
    }}>
      {accent && (
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${accent}80,transparent)`}}/>
      )}
      {children}
    </div>
  );
}

/* ── Fetch GST button ── */
function FetchBtn({ onClick, loading }) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        flexShrink:0, display:"inline-flex", alignItems:"center", gap:7,
        padding:"0 18px", height:50,
        background: hov?"linear-gradient(135deg,#F0D880,#C89A30)":"linear-gradient(135deg,#E8C97A,#B8913A)",
        border:"1px solid rgba(232,201,122,0.5)",
        borderRadius:12, color:"#1A1008",
        fontSize:12, fontWeight:800, cursor:loading?"not-allowed":"pointer",
        fontFamily:"inherit", whiteSpace:"nowrap", opacity:loading?.6:1,
        letterSpacing:".05em", textTransform:"uppercase",
        transition:"background .2s, transform .15s, box-shadow .2s",
        transform:hov&&!loading?"translateY(-1px)":"none",
        boxShadow:hov&&!loading?"0 6px 20px rgba(232,201,122,.40)":"0 2px 10px rgba(232,201,122,.20)",
      }}>
      {loading?<><Spin dark/>Fetching…</>:<><span style={{fontSize:14}}>⚡</span>Fetch GST</>}
    </button>
  );
}

function Spin({ dark }) {
  return <span style={{display:"inline-block",width:13,height:13,
    border:`2px solid ${dark?"rgba(0,0,0,.25)":"rgba(255,255,255,.3)"}`,
    borderTopColor:dark?"#1A1008":"#fff",
    borderRadius:"50%",animation:"ispin .7s linear infinite"}}/>;
}

/* ── Party card ── */
function PartyCard({ title,icon,accent,gstin,onGstinChange,onFetch,loading,error,fields,values,onChange }) {
  return (
    <Card accent={accent}>
      <SHD icon={icon} label={title} accent={C.gold}/>
      <div style={{marginBottom:14}}>
        <label style={{ display:"block", fontSize:9, fontWeight:800, color:C.gold,
          textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>
          GSTIN / UIN — Auto-fill
        </label>
        <div style={{display:"flex", gap:8}}>
          <FloatInput value={gstin} onChange={onGstinChange} maxLength={15} mono style={{flex:1}}/>
          <FetchBtn onClick={onFetch} loading={loading}/>
        </div>
        {error && <p style={{margin:"6px 0 0",fontSize:11,color:C.red,fontWeight:600}}>{error}</p>}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        {fields.map(({label,key,mono})=>(
          <FloatInput key={key} label={label} value={values[key]||""} mono={mono}
            onChange={e=>onChange(key, key==="pan"?e.target.value.toUpperCase():e.target.value)}/>
        ))}
      </div>
    </Card>
  );
}

/* ── Toast ── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:22, left:"50%", zIndex:9999, transform:"translateX(-50%)",
      animation:"islidedown .32s cubic-bezier(.4,0,.2,1) both",
      display:"flex", alignItems:"center", gap:10,
      background: toast.ok ? "#081A10" : "#1A0808",
      border:`1px solid ${toast.ok?"rgba(52,211,153,.4)":"rgba(248,113,113,.4)"}`,
      borderRadius:14, padding:"12px 22px",
      color: toast.ok ? C.green : C.red,
      fontSize:13, fontWeight:600,
      boxShadow:"0 12px 40px rgba(0,0,0,.75)",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <span style={{fontSize:15}}>{toast.ok?"✓":"✕"}</span>{toast.msg}
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
export default function InvoiceGenerator({ initialData = null }) {
  /* If initialData passed (editing existing), use it; else start fresh */
  const [inv,        setInv]        = useState(initialData || defaultInvoice);
  const [editingId,  setEditingId]  = useState(initialData?._id || null);
  const [isProforma, setIsProforma] = useState(initialData?.isProforma || false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [gstLoading, setGstLoading] = useState({from:false, to:false});
  const [gstError,   setGstError]   = useState({from:"",    to:""  });
  const [hdrVis,     setHdrVis]     = useState(false);

  const { user } = useAuth();

  useEffect(()=>{ setTimeout(()=>setHdrVis(true),80); },[]);

  const subtotal = inv.items.reduce((s,i)=>s+i.amount,0);
  const isIGST   = inv.taxType==="igst";
  const igstAmt  = subtotal*inv.tax/100;
  const cgst     = subtotal*inv.tax/200;
  const sgst     = subtotal*inv.tax/200;
  const taxAmt   = isIGST?igstAmt:cgst+sgst;
  const total    = subtotal+taxAmt;

  const set     = p => setInv(s=>({...s,...p}));
  const setBank = (f,v) => setInv(s=>({...s,bank:{...s.bank,[f]:v}}));

  const showToast = (msg,ok=true) => {
    setToast({msg,ok});
    setTimeout(()=>setToast(null),3200);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(()=>{ window.print(); setTimeout(()=>setIsPrinting(false),600); },120);
  };

  /* ── Save or Update invoice ── */
  const handleSave = async () => {
    if (!user) { showToast("Please login to save invoices.", false); return; }
    setIsSaving(true);
    try {
      const payload = { ...inv, isProforma, subtotal, taxAmt, total };
      if (editingId) {
        /* Update existing */
        await invoiceApi.update(editingId, payload);
        showToast("Invoice updated successfully.");
      } else {
        /* Create new */
        const data = await invoiceApi.create(payload);
        setEditingId(data.invoice._id);
        showToast("Invoice saved successfully.");
      }
    } catch (err) {
      showToast(err.message || "Failed to save invoice.", false);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── New invoice ── */
  const handleNew = () => {
    setInv(defaultInvoice);
    setEditingId(null);
    setIsProforma(false);
    showToast("Started new invoice.");
  };

  const fetchGST = async party => {
    const gstin=inv[party].gstin.trim();
    if(!gstin||gstin.length<15){ setGstError(e=>({...e,[party]:"Enter a valid 15-digit GSTIN"})); return; }
    setGstError(e=>({...e,[party]:""})); setGstLoading(l=>({...l,[party]:true}));
    try{
      const res  = await fetch(`https://${API_HOST}/getGSTDetailsUsingGST/${gstin}`,
        {headers:{"x-rapidapi-key":API_KEY,"x-rapidapi-host":API_HOST}});
      const json = await res.json();
      if(!json.success||!json.data?.length){ setGstError(e=>({...e,[party]:"No GST details found."})); return; }
      const rec=json.data[0], name=rec.tradeName||rec.legalName||"";
      const pan=gstin.length===15?gstin.slice(2,12):"";
      const addr=rec.principalAddress?.address||{};
      const line=[addr.buildingNumber,addr.buildingName,addr.floorNumber,addr.street,addr.location].filter(Boolean).join(", ");
      if(name){
        setInv(s=>({...s,[party]:{...s[party],name,
          address:line||s[party].address, city:addr.district||addr.location||s[party].city,
          state:addr.stateCode||s[party].state, zipCode:addr.pincode||s[party].zipCode,
          ...(party==="from"?{pan:pan||s.from.pan}:{}),
        }}));
        showToast(`✓ ${party==="from"?"Seller":"Buyer"}: ${name}`);
      } else setGstError(e=>({...e,[party]:"Could not extract business name."}));
    } catch(err){ setGstError(e=>({...e,[party]:"API error: "+(err.message||"Unknown")})); }
    finally{ setGstLoading(l=>({...l,[party]:false})); }
  };

  const updateItem=(idx,field,value)=>{
    set({items:inv.items.map((item,i)=>{
      if(i!==idx) return item;
      const u={...item,[field]:value};
      if(field==="quantity"||field==="rate") u.amount=(u.quantity||0)*(u.rate||0);
      return u;
    })});
  };

  const iSt=(extra={})=>({
    width:"100%", boxSizing:"border-box",
    background:C.surface, border:`1.5px solid ${C.border}`,
    borderRadius:10, padding:"12px 10px", fontSize:14,
    color:C.text1, fontFamily:"inherit", outline:"none",
    transition:"border-color .2s", ...extra,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
        #inv-form *{ font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        @keyframes ispin{ to{ transform:rotate(360deg) } }
        @keyframes ifadeup{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes islidedown{ from{opacity:0;transform:translateY(-14px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes iglow{ 0%,100%{box-shadow:0 4px 22px rgba(232,201,122,.28)} 50%{box-shadow:0 4px 32px rgba(232,201,122,.52)} }
        .irow:hover{ border-color:rgba(232,201,122,.3)!important; background:rgba(255,255,255,.05)!important; }
        .iinput:focus{ border-color:#E8C97A!important; box-shadow:0 0 0 3px rgba(232,201,122,.12)!important; }
        .iadd:hover{ background:rgba(232,201,122,.14)!important; border-color:rgba(232,201,122,.5)!important; transform:translateY(-1px); }
        .idel:hover{ background:rgba(248,113,113,.18)!important; color:#F87171!important; }
        .iprint:hover{ transform:translateY(-2px)!important; box-shadow:0 10px 32px rgba(232,201,122,.48)!important; }
        .itog:hover{ border-color:rgba(232,201,122,.5)!important; color:#E8C97A!important; }
        .isave:hover{ transform:translateY(-1px)!important; box-shadow:0 8px 24px rgba(52,211,153,.35)!important; }
        .inew:hover{ border-color:rgba(232,201,122,.5)!important; color:#E8C97A!important; }
        input[type=date]::-webkit-calendar-picker-indicator{ filter:invert(.7) sepia(1) saturate(2) hue-rotate(5deg); cursor:pointer; }
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{ -webkit-appearance:none; margin:0; }
        select option{ background:#1A1610; color:#F5F2EC; }
        ::placeholder{ color:#5A5347!important; }
        @media(max-width:860px){ .i2col{ grid-template-columns:1fr!important; } }
        @media(max-width:640px){
          .i3col{ grid-template-columns:1fr 1fr!important; }
          .iheader{ flex-direction:column!important; align-items:flex-start!important; }
          .iactions{ width:100%!important; }
          .iactions > button{ flex:1; justify-content:center; }
          .iitemgrid{ grid-template-columns:1fr 1fr!important; }
          .iitemgrid > *:first-child{ grid-column:1/-1; }
        }
        @media print{
          @page{ size:A4; margin:0; }
          body{ margin:1cm!important; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
          #inv-form{ display:none!important; }
          #inv-print{ display:block!important; }
        }
      `}</style>

      <Toast toast={toast}/>

      {/* Print view */}
      <div id="inv-print" style={{display:"none"}}>
        <InvoicePrint invoice={inv} isProforma={isProforma}
          subtotal={subtotal} taxAmt={taxAmt} total={total} cgst={cgst} sgst={sgst} igstAmt={igstAmt}/>
      </div>

      {/* ═══ MAIN UI ═══ */}
      <div id="inv-form" style={{
        minHeight:"100vh", background:C.bg,
        backgroundImage:`
          radial-gradient(ellipse 70% 45% at 15% -5%, rgba(232,201,122,.07) 0%,transparent 60%),
          radial-gradient(ellipse 55% 40% at 85% 105%, rgba(147,51,234,.05) 0%,transparent 55%)
        `,
        padding:"36px 20px 80px",
      }}>
        <div style={{maxWidth:1160, margin:"0 auto"}}>

          {/* ── HEADER ── */}
          <div className="iheader" style={{
            opacity:hdrVis?1:0, transform:hdrVis?"none":"translateY(-18px)",
            transition:"opacity .55s, transform .55s",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:16, marginBottom:40,
          }}>
            <div style={{display:"flex", alignItems:"center", gap:16}}>
              <div style={{
                width:54, height:54, flexShrink:0, borderRadius:15,
                background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                display:"flex", alignItems:"center", justifyContent:"center",
                animation:"iglow 3.5s ease infinite",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A1008" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="9" y1="7" x2="15" y2="7"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                  <line x1="9" y1="15" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <h1 style={{
                  margin:0, fontFamily:"'DM Serif Display',serif",
                  fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:400,
                  color:C.white, letterSpacing:"-.01em", lineHeight:1.1,
                }}>
                  {editingId ? "Edit Invoice" : "New Invoice"}
                </h1>
                <p style={{margin:"4px 0 0", fontSize:13, color:C.text3}}>
                  {editingId
                    ? `Editing: ${inv.invoiceNumber || "Untitled"}`
                    : "Professional GST invoices — beautifully crafted"}
                </p>
              </div>
            </div>

            <div className="iactions" style={{display:"flex", gap:10, flexWrap:"wrap"}}>
              {/* My Invoices link */}
              <a href="/invoices"
                style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  padding:"11px 18px", borderRadius:12, cursor:"pointer",
                  border:`1.5px solid ${C.border}`,
                  background:"transparent", color:C.text2,
                  fontSize:13, fontWeight:600, textDecoration:"none",
                  transition:"all .2s",
                }}
                onMouseOver={e=>{ e.currentTarget.style.borderColor=C.goldBdr; e.currentTarget.style.color=C.gold; }}
                onMouseOut={e=>{  e.currentTarget.style.borderColor=C.border;   e.currentTarget.style.color=C.text2; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                My Invoices
              </a>

              {/* New invoice button */}
              {editingId && (
                <button className="inew" onClick={handleNew}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"11px 18px", borderRadius:12, cursor:"pointer",
                    border:`1.5px solid ${C.border}`,
                    background:"transparent", color:C.text2,
                    fontSize:13, fontWeight:600, transition:"all .2s",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Invoice
                </button>
              )}

              {/* Proforma toggle */}
              <button className="itog"
                onClick={()=>{ setIsProforma(p=>!p); showToast(isProforma?"Switched to Tax Invoice":"Switched to Proforma"); }}
                style={{
                  padding:"11px 18px", borderRadius:12, cursor:"pointer",
                  border:`1.5px solid ${isProforma?"rgba(232,201,122,.45)":C.border}`,
                  background:isProforma?C.goldBg:"transparent",
                  color:isProforma?C.gold:C.text2,
                  fontSize:13, fontWeight:600, transition:"all .2s",
                }}>
                ⇄ {isProforma?"Tax Invoice":"Proforma"}
              </button>

              {/* Save button */}
              <button className="isave" onClick={handleSave} disabled={isSaving}
                style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  padding:"11px 20px", borderRadius:12, cursor:"pointer",
                  background: isSaving ? "rgba(52,211,153,.3)" : "rgba(52,211,153,.15)",
                  border:`1.5px solid rgba(52,211,153,.4)`,
                  color:C.green, fontSize:13, fontWeight:700,
                  transition:"all .2s",
                }}>
                {isSaving
                  ? <><Spin/>Saving…</>
                  : <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      {editingId ? "Update" : "Save"}
                    </>}
              </button>

              {/* Print button */}
              <button className="iprint" onClick={handlePrint} disabled={isPrinting}
                style={{
                  display:"inline-flex", alignItems:"center", gap:9,
                  padding:"11px 24px",
                  background:"linear-gradient(135deg,#E8C97A,#B8913A)",
                  border:"none", borderRadius:12, color:"#1A1008",
                  fontSize:13, fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 18px rgba(232,201,122,.28)",
                  transition:"transform .2s, box-shadow .2s",
                }}>
                {isPrinting
                  ?<><Spin dark/>Preparing…</>
                  :<>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 6 2 18 2 18 9"/>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                      <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Print / Save PDF
                  </>}
              </button>
            </div>
          </div>

          {/* ── INVOICE IDENTITY ── */}
          <Section delay={0.08}>
            <Card accent={C.goldDim} style={{marginBottom:20}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                flexWrap:"wrap", gap:10, marginBottom:20}}>
                <span style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  background:C.goldBg, border:`1px solid ${C.goldBdr}`,
                  color:C.gold, fontSize:10, fontWeight:800,
                  padding:"5px 14px", borderRadius:20,
                  letterSpacing:".12em", textTransform:"uppercase",
                }}>◆ {isProforma?"Proforma Invoice":"Tax Invoice"}</span>
                <span style={{fontSize:12, color:C.text3}}>
                  {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
                </span>
              </div>
              <div className="i3col" style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
                <FloatInput label="Invoice Number" value={inv.invoiceNumber} onChange={e=>set({invoiceNumber:e.target.value})}/>
                <FloatInput label="Date" value={inv.date} type="date" onChange={e=>set({date:e.target.value})}/>
                <FloatInput label="Supplier's Reference" value={inv.suppliersRef} onChange={e=>set({suppliersRef:e.target.value})}/>
              </div>
            </Card>
          </Section>

          {/* ── SHIPMENT ── */}
          <Section delay={0.13}>
            <Card style={{marginBottom:20}}>
              <SHD icon="📦" label="Shipment Details"/>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14}}>
                <FloatInput label="Buyer's Order No."   value={inv.buyerOrderNo}       onChange={e=>set({buyerOrderNo:e.target.value})}/>
                <FloatInput label="Dispatch Doc No."    value={inv.dispatchDocNo}      onChange={e=>set({dispatchDocNo:e.target.value})}/>
                <FloatInput label="Dispatched Through"  value={inv.dispatchedThrough}  onChange={e=>set({dispatchedThrough:e.target.value})}/>
                <FloatInput label="Terms of Delivery"   value={inv.termsOfDelivery}    onChange={e=>set({termsOfDelivery:e.target.value})}/>
              </div>
            </Card>
          </Section>

          {/* ── SELLER / BUYER ── */}
          <Section delay={0.18}>
            <div className="i2col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20}}>
              <PartyCard
                title="From — Seller" icon="🏭" accent={C.blue}
                gstin={inv.from.gstin}
                onGstinChange={e=>{ setGstError(er=>({...er,from:""})); setInv(s=>({...s,from:{...s.from,gstin:e.target.value.toUpperCase()}})); }}
                onFetch={()=>fetchGST("from")} loading={gstLoading.from} error={gstError.from}
                fields={[
                  {label:"Company Name",key:"name"},{label:"Address",key:"address"},
                  {label:"City",key:"city"},{label:"State",key:"state"},
                  {label:"ZIP Code",key:"zipCode"},{label:"PAN",key:"pan",mono:true},
                ]}
                values={inv.from} onChange={(k,v)=>setInv(s=>({...s,from:{...s.from,[k]:v}}))}
              />
              <PartyCard
                title="To — Buyer" icon="🏢" accent={C.purple}
                gstin={inv.to.gstin}
                onGstinChange={e=>{ setGstError(er=>({...er,to:""})); setInv(s=>({...s,to:{...s.to,gstin:e.target.value.toUpperCase()}})); }}
                onFetch={()=>fetchGST("to")} loading={gstLoading.to} error={gstError.to}
                fields={[
                  {label:"Client Name",key:"name"},{label:"Address",key:"address"},
                  {label:"City",key:"city"},{label:"State",key:"state"},
                  {label:"ZIP Code",key:"zipCode"},
                ]}
                values={inv.to} onChange={(k,v)=>setInv(s=>({...s,to:{...s.to,[k]:v}}))}
              />
            </div>
          </Section>

          {/* ── LINE ITEMS ── */}
          <Section delay={0.23}>
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:16}}>
                <SHD icon="📋" label="Line Items"/>
                <button className="iadd"
                  onClick={()=>set({items:[...inv.items,{description:"",hsn:"",quantity:1,rate:0,per:"Nos",amount:0}]})}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"9px 18px", borderRadius:10, cursor:"pointer",
                    border:"1.5px solid rgba(232,201,122,.2)",
                    background:"rgba(232,201,122,.06)",
                    color:C.gold, fontSize:13, fontWeight:700,
                    transition:"all .2s", marginBottom:20,
                  }}>
                  <span style={{fontSize:16,lineHeight:1}}>+</span> Add Item
                </button>
              </div>
              <div className="iitemgrid" style={{
                display:"grid",
                gridTemplateColumns:"3fr 1.2fr .9fr 1.6fr .8fr 1.3fr 36px",
                gap:10, padding:"0 4px", marginBottom:8,
              }}>
                {["Description","HSN / SAC","Qty","Rate (₹)","Unit","Amount",""].map((h,i)=>(
                  <span key={i} style={{ fontSize:10, fontWeight:800, color:C.text4,
                    textTransform:"uppercase", letterSpacing:".1em",
                    textAlign:i>=3&&i<=5?"right":"left" }}>{h}</span>
                ))}
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                {inv.items.map((item,idx)=>(
                  <div key={idx} className="irow iitemgrid" style={{
                    display:"grid",
                    gridTemplateColumns:"3fr 1.2fr .9fr 1.6fr .8fr 1.3fr 36px",
                    gap:10, alignItems:"center",
                    background:C.surface, border:`1px solid ${C.border}`,
                    borderRadius:12, padding:"10px 12px",
                    transition:"all .2s",
                    animation:`ifadeup .28s ease ${idx*.06}s both`,
                  }}>
                    <input className="iinput" value={item.description} placeholder="Item description"
                      onChange={e=>updateItem(idx,"description",e.target.value)} style={iSt()}/>
                    <input className="iinput" value={item.hsn} placeholder="HSN"
                      onChange={e=>updateItem(idx,"hsn",e.target.value)} style={iSt({textAlign:"center"})}/>
                    <input className="iinput" type="number" value={item.quantity}
                      onChange={e=>updateItem(idx,"quantity",parseFloat(e.target.value)||0)}
                      style={iSt({textAlign:"center"})}/>
                    <input className="iinput" type="number" value={item.rate}
                      onChange={e=>updateItem(idx,"rate",parseFloat(e.target.value)||0)}
                      style={iSt({textAlign:"right"})}/>
                    <input className="iinput" value={item.per}
                      onChange={e=>updateItem(idx,"per",e.target.value)}
                      style={iSt({textAlign:"center"})}/>
                    <div style={{textAlign:"right",fontSize:14,fontWeight:700,
                      color:C.gold, fontVariantNumeric:"tabular-nums"}}>
                      <AnimNum value={item.amount}/>
                    </div>
                    {inv.items.length>1
                      ?<button className="idel"
                          onClick={()=>set({items:inv.items.filter((_,i)=>i!==idx)})}
                          style={{width:32,height:32,borderRadius:8,border:"none",
                            background:"rgba(248,113,113,.08)",color:C.text4,
                            cursor:"pointer",fontSize:16,display:"flex",
                            alignItems:"center",justifyContent:"center",transition:"all .2s"}}>✕</button>
                      :<div/>
                    }
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* ── NOTES + SUMMARY ── */}
          <Section delay={0.28}>
            <div className="i2col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20}}>
              <Card>
                <SHD icon="📝" label="Declaration & Notes"/>
                <FloatTextarea label="Notes / Declaration" value={inv.notes} onChange={e=>set({notes:e.target.value})}/>
              </Card>
              <Card accent={C.goldDim}>
                <div style={{position:"absolute",bottom:-50,right:-50,width:200,height:200,
                  borderRadius:"50%",background:"radial-gradient(rgba(232,201,122,.06),transparent)",
                  pointerEvents:"none"}}/>
                <SHD icon="💰" label="Summary"/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:8}}>
                  <span style={{fontSize:13,color:C.text2,fontWeight:500}}>Subtotal</span>
                  <span style={{fontSize:17,fontWeight:700,color:C.text1,fontVariantNumeric:"tabular-nums"}}>
                    <AnimNum value={subtotal}/>
                  </span>
                </div>
                <div style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <select value={inv.taxType} onChange={e=>set({taxType:e.target.value})}
                        style={{background:"rgba(255,255,255,.06)",border:`1.5px solid ${C.border}`,
                          borderRadius:8,padding:"7px 10px",fontSize:12,color:C.gold,
                          fontWeight:700,cursor:"pointer",outline:"none"}}>
                        <option value="cgst_sgst">CGST + SGST</option>
                        <option value="igst">IGST</option>
                      </select>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <input type="number"
                          value={isIGST?inv.tax:inv.tax/2}
                          onChange={e=>{const v=parseFloat(e.target.value)||0;set({tax:isIGST?v:v*2});}}
                          style={{width:52,background:"rgba(255,255,255,.06)",
                            border:`1.5px solid ${C.border}`,borderRadius:8,
                            padding:"7px 8px",fontSize:13,color:C.gold,
                            fontWeight:700,outline:"none",textAlign:"center"}}/>
                        <span style={{fontSize:12,color:C.text3}}>%</span>
                      </div>
                    </div>
                    <span style={{fontSize:14,fontWeight:600,color:C.text1,fontVariantNumeric:"tabular-nums"}}>
                      <AnimNum value={isIGST?igstAmt:cgst}/>
                    </span>
                  </div>
                  {!isIGST&&(
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      <span style={{fontSize:12,color:C.text3}}>SGST @ {inv.tax/2}%</span>
                      <span style={{fontSize:13,color:C.text2,fontVariantNumeric:"tabular-nums"}}>
                        <AnimNum value={sgst}/>
                      </span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.text1}}>Total Amount</span>
                  <span style={{fontSize:26,fontWeight:800,color:C.gold,
                    fontVariantNumeric:"tabular-nums",textShadow:"0 0 24px rgba(232,201,122,.25)"}}>
                    <AnimNum value={total}/>
                  </span>
                </div>
              </Card>
            </div>
          </Section>

          {/* ── BANK DETAILS ── */}
          <Section delay={0.33}>
            <Card>
              <SHD icon="🏦" label="Bank Details"/>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:14}}>
                {[
                  ["bankName",            "Bank Name",        false],
                  ["accountHolder",       "Account Holder",   false],
                  ["accountNumber",       "Account Number",   true ],
                  ["confirmAccountNumber","Confirm A/C No.",  true ],
                ].map(([key,label,mono])=>(
                  <div key={key}>
                    <FloatInput label={label} value={inv.bank[key]} mono={mono}
                      onChange={e=>setBank(key, e.target.value)}
                      style={
                        key==="confirmAccountNumber"&&inv.bank.confirmAccountNumber&&
                        inv.bank.accountNumber!==inv.bank.confirmAccountNumber
                          ?{outline:"2px solid rgba(248,113,113,.4)",borderRadius:12}:{}
                      }/>
                    {key==="confirmAccountNumber"&&inv.bank.confirmAccountNumber&&
                     inv.bank.accountNumber!==inv.bank.confirmAccountNumber&&
                     <p style={{margin:"5px 0 0",fontSize:11,color:C.red,fontWeight:600}}>Account numbers don't match</p>}
                  </div>
                ))}
              </div>
              {/* Row 2: IFSC, Account Type, Branch */}
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:14}}>
                <FloatInput label="IFSC Code" value={inv.bank.ifsc} mono
                  onChange={e=>setBank("ifsc", e.target.value.toUpperCase())}/>
                <div>
                  <select value={inv.bank.accountType} onChange={e=>setBank("accountType",e.target.value)}
                    style={{width:"100%",background:C.surface,border:`1.5px solid ${C.border}`,
                      borderRadius:12,padding:"13px 14px",fontSize:14,color:C.text1,
                      cursor:"pointer",outline:"none"}}>
                    <option value="" disabled>Account Type</option>
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <FloatInput label="Branch" value={inv.bank.branch}
                  onChange={e=>setBank("branch",e.target.value)}/>
              </div>
            </Card>
          </Section>

        </div>
      </div>
    </>
  );
}