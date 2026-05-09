"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import AuthGuard   from "../auth/components/AuthGuard";
import { authApi } from "../auth/api/authApi";
import { useRouter } from "next/navigation";

/* ── Design tokens ── */
const C = {
  bg:"var(--inv-bg)", surface:"var(--inv-surface)",
  surfaceHover:"var(--inv-surface-hover)",
  border:"var(--inv-border)", gold:"#E8C97A",
  goldBg:"rgba(232,201,122,0.10)", goldBdr:"rgba(232,201,122,0.30)",
  white:"#FFFFFF", text1:"var(--inv-text1)", text2:"var(--inv-text2)",
  text3:"var(--inv-text3)", text4:"var(--inv-text4)", red:"#F87171", green:"#34D399",
  blue:"#60A5FA",
};

/* ── Shared card ── */
const card = {
  background:"var(--inv-surface)", border:`1px solid ${C.border}`,
  borderRadius:16, padding:"24px 26px", marginBottom:20,
};

const sectionTitle = {
  margin:"0 0 18px", fontSize:14, fontWeight:800,
  color:C.gold, textTransform:"uppercase", letterSpacing:".1em",
};

/* ── Floating label input ── */
function FloatInput({ label, type="text", value, onChange, disabled, mono }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value !== "" && value !== undefined && value !== null);
  return (
    <div style={{ position:"relative", marginBottom:16 }}>
      <input
        type={type} value={value||""} onChange={onChange} disabled={disabled}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box",
          background: disabled?"rgba(255,255,255,0.02)":focused?"var(--inv-surface-hover)":C.surface,
          border:`1.5px solid ${focused?C.gold:C.border}`,
          borderRadius:12, padding: active?"20px 14px 6px":"13px 14px",
          fontSize:14, color: disabled?C.text4:C.text1,
          fontFamily: mono?"'JetBrains Mono','Courier New',monospace":"'DM Sans',sans-serif",
          outline:"none", transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused?"0 0 0 3px rgba(232,201,122,0.12)":"none",
          cursor: disabled?"not-allowed":"text",
          letterSpacing: mono?".04em":"normal",
        }}
      />
      <label style={{
        position:"absolute", left:14, pointerEvents:"none",
        top: active?6:"50%", transform: active?"none":"translateY(-50%)",
        fontSize: active?9:14, fontWeight: active?700:400,
        color: focused?C.gold:(active?C.text3:C.text4),
        letterSpacing: active?".07em":"normal",
        textTransform: active?"uppercase":"none",
        transition:"all .2s cubic-bezier(0.4,0,0.2,1)",
      }}>{label}</label>
    </div>
  );
}

/* ── Indian banks list ── */
const INDIAN_BANKS = [
  "Axis Bank","Bank of Baroda","Bank of India","Bank of Maharashtra",
  "Canara Bank","Central Bank of India","City Union Bank","DBS Bank",
  "DCB Bank","Dhanlaxmi Bank","Federal Bank","HDFC Bank","ICICI Bank",
  "IDBI Bank","IDFC First Bank","Indian Bank","Indian Overseas Bank",
  "IndusInd Bank","Jammu & Kashmir Bank","Karnataka Bank","Karur Vysya Bank",
  "Kotak Mahindra Bank","Nainital Bank","Punjab & Sind Bank","Punjab National Bank",
  "RBL Bank","South Indian Bank","Standard Chartered Bank","State Bank of India",
  "Tamilnad Mercantile Bank","UCO Bank","Union Bank of India","Yes Bank",
  "HSBC Bank","Citibank","Deutsche Bank","Bandhan Bank","AU Small Finance Bank",
  "Equitas Small Finance Bank","Jana Small Finance Bank","Ujjivan Small Finance Bank",
  "ESAF Small Finance Bank","Paytm Payments Bank","Airtel Payments Bank",
  "India Post Payments Bank","Fino Payments Bank",
];

/* ── Bank name searchable dropdown ── */
function BankDropdown({ value, onChange }) {
  const [query,   setQuery]   = useState(value||"");
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  useEffect(()=>{ setQuery(value||""); },[value]);

  const filtered = query.length>=1
    ? INDIAN_BANKS.filter(b=>b.toLowerCase().includes(query.toLowerCase())).slice(0,10)
    : INDIAN_BANKS.slice(0,10);

  const select=(bank)=>{ setQuery(bank); onChange(bank); setOpen(false); };

  return (
    <div ref={ref} style={{ position:"relative", marginBottom:16 }}>
      <label style={{
        position:"absolute", left:14, pointerEvents:"none", zIndex:1,
        top: (focused||(query!==""))?6:"50%",
        transform: (focused||(query!==""))?"none":"translateY(-50%)",
        fontSize: (focused||(query!==""))?9:14,
        fontWeight: (focused||(query!==""))?700:400,
        color: focused?C.gold:((query!==""))?C.text3:C.text4,
        letterSpacing: (focused||(query!==""))?".07em":"normal",
        textTransform: (focused||(query!==""))?"uppercase":"none",
        transition:"all .2s cubic-bezier(0.4,0,0.2,1)",
      }}>Bank Name</label>
      <input
        value={query} placeholder=""
        onFocus={()=>{ setFocused(true); setOpen(true); }}
        onBlur={()=>setFocused(false)}
        onChange={e=>{ setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        style={{
          width:"100%", boxSizing:"border-box",
          background: focused?"var(--inv-surface-hover)":C.surface,
          border:`1.5px solid ${focused?C.gold:C.border}`,
          borderRadius:12, padding:"20px 36px 6px 14px",
          fontSize:14, color:"var(--inv-text1)", fontFamily:"'DM Sans',sans-serif",
          outline:"none", transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: focused?"0 0 0 3px rgba(232,201,122,0.12)":"none",
        }}
      />
      <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
        fontSize:14, color:"var(--inv-text4)", pointerEvents:"none" }}>▾</span>
      {open&&filtered.length>0&&(
        <div style={{
          position:"absolute", top:"100%", left:0, right:0,
          background:"var(--inv-dropdown-bg)", border:`1px solid ${C.border}`,
          borderRadius:10, marginTop:3, zIndex:9999,
          maxHeight:220, overflowY:"auto",
          boxShadow:"0 8px 32px rgba(0,0,0,.6)",
        }}>
          {filtered.map(bank=>(
            <div key={bank} onMouseDown={()=>select(bank)}
              style={{
                padding:"10px 14px", fontSize:13,
                color: bank===value?C.gold:C.text2,
                background: bank===value?C.goldBg:"transparent",
                cursor:"pointer", transition:"background .1s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHover}
              onMouseLeave={e=>e.currentTarget.style.background=bank===value?C.goldBg:"transparent"}
            >{bank}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Status message box ── */
function StatusBox({ msg }) {
  if (!msg?.text) return null;
  return (
    <div style={{
      background: msg.ok?"rgba(52,211,153,.08)":"rgba(248,113,113,.08)",
      border:`1px solid ${msg.ok?"rgba(52,211,153,.3)":"rgba(248,113,113,.3)"}`,
      borderRadius:10, padding:"10px 14px", marginBottom:16,
      fontSize:13, color:msg.ok?C.green:C.red, textAlign:"center",
    }}>{msg.text}</div>
  );
}

/* ── Gold button ── */
function GoldBtn({ children, onClick, loading, type="button" }) {
  return (
    <button type={type} onClick={onClick} disabled={loading}
      style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"11px 24px",
        background: loading?"rgba(232,201,122,.4)":"linear-gradient(135deg,#E8C97A,#B8913A)",
        border:"none", borderRadius:10, color:"var(--inv-dropdown-bg)",
        fontSize:13, fontWeight:800, cursor:loading?"not-allowed":"pointer",
        fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
        boxShadow:"0 4px 16px rgba(232,201,122,.22)",
      }}
      onMouseOver={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseOut={e=>e.currentTarget.style.transform="none"}
    >
      {children}
    </button>
  );
}

/* ── LOCAL STORAGE KEYS ── */
const BANK_KEY = "inv_saved_bank";
const GST_KEY  = "inv_saved_gst";

/* ════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();

  /* Profile */
  const [name,     setName]     = useState(user?.name||"");
  const [profMsg,  setProfMsg]  = useState({text:"",ok:true});
  const [profLoad, setProfLoad] = useState(false);

  /* Password */
  const [curPw,  setCurPw]  = useState("");
  const [newPw,  setNewPw]  = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwMsg,  setPwMsg]  = useState({text:"",ok:true});
  const [pwLoad, setPwLoad] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /* Bank details (saved in localStorage, pre-fills invoice generator) */
  const [bank, setBank] = useState({
    bankName:"", accountHolder:"", accountNumber:"",
    ifsc:"", accountType:"Current", branch:"",
  });
  const [bankMsg,  setBankMsg]  = useState({text:"",ok:true});

  /* GST details */
  const [gst, setGst] = useState({
    companyName:"", gstin:"", pan:"", address:"",
    city:"", state:"", zipCode:"",
  });
  const [gstMsg, setGstMsg] = useState({text:"",ok:true});

  /* Load saved data on mount */
  useEffect(()=>{
    try {
      const savedBank = localStorage.getItem(BANK_KEY);
      if (savedBank) setBank(JSON.parse(savedBank));
      const savedGst = localStorage.getItem(GST_KEY);
      if (savedGst) setGst(JSON.parse(savedGst));
    } catch {}
  },[]);

  const initials = user?.name
    ? user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)
    : "?";

  /* Save profile */
  async function handleProfileSave(e) {
    e.preventDefault();
    if (!name.trim()) { setProfMsg({text:"Name cannot be empty.",ok:false}); return; }
    setProfLoad(true); setProfMsg({text:"",ok:true});
    try {
      await updateProfile({ name:name.trim() });
      setProfMsg({text:"Profile updated successfully.",ok:true});
    } catch(err) { setProfMsg({text:err.message,ok:false}); }
    finally { setProfLoad(false); }
  }

  /* Change password */
  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!curPw||!newPw||!confPw){ setPwMsg({text:"All fields are required.",ok:false}); return; }
    if (newPw.length<8){ setPwMsg({text:"Minimum 8 characters.",ok:false}); return; }
    if (newPw!==confPw){ setPwMsg({text:"Passwords do not match.",ok:false}); return; }
    setPwLoad(true); setPwMsg({text:"",ok:true});
    try {
      await authApi.changePassword({currentPassword:curPw,newPassword:newPw});
      setPwMsg({text:"Password changed successfully.",ok:true});
      setCurPw(""); setNewPw(""); setConfPw("");
    } catch(err){ setPwMsg({text:err.message,ok:false}); }
    finally{ setPwLoad(false); }
  }

  /* Save bank details to localStorage */
  function handleBankSave(e) {
    e.preventDefault();
    localStorage.setItem(BANK_KEY, JSON.stringify(bank));
    setBankMsg({text:"Bank details saved. They will auto-fill on new invoices.",ok:true});
    setTimeout(()=>setBankMsg({text:"",ok:true}),3500);
  }

  /* Save GST details to localStorage */
  function handleGstSave(e) {
    e.preventDefault();
    if (gst.gstin && gst.gstin.length!==15) {
      setGstMsg({text:"GSTIN must be 15 characters.",ok:false}); return;
    }
    localStorage.setItem(GST_KEY, JSON.stringify(gst));
    setGstMsg({text:"GST details saved. They will auto-fill on new invoices.",ok:true});
    setTimeout(()=>setGstMsg({text:"",ok:true}),3500);
  }

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <AuthGuard redirectTo="/login">
      <div style={{
        minHeight:"100vh", background:"var(--inv-bg)", color:"var(--inv-text1)",
        backgroundImage:`
          radial-gradient(ellipse 70% 45% at 15% -5%,rgba(232,201,122,.06) 0%,transparent 60%),
          radial-gradient(ellipse 55% 40% at 85% 105%,rgba(147,51,234,.04) 0%,transparent 55%)
        `,
        padding:"40px 20px 80px",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          .rbtn:hover{background:rgba(248,113,113,.14)!important;border-color:rgba(248,113,113,.4)!important;color:#F87171!important}
          .sec-toggle:hover{background:rgba(255,255,255,.05)!important}
        `}</style>

        <div style={{ maxWidth:720, margin:"0 auto", animation:"fadeUp .4s ease both" }}>

          {/* ── Page title ── */}
          <h1 style={{
            margin:"0 0 28px",
            fontFamily:"'DM Serif Display',serif",
            fontSize:"clamp(1.5rem,4vw,2rem)",
            fontWeight:400, color:"#dba723", letterSpacing:"-.01em",
          }}>
            Profile &amp; Settings
          </h1>

          {/* ── Avatar + info ── */}
          <div style={{ ...card, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
            <div style={{
              width:72, height:72, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#E8C97A,#B8913A)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, fontWeight:800, color:"var(--inv-dropdown-bg)",
              boxShadow:"0 4px 20px rgba(232,201,122,.3)", overflow:"hidden",
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user?.name} style={{width:72,height:72,objectFit:"cover"}}/>
                : initials
              }
            </div>
            <div style={{flex:1}}>
              <p style={{margin:0,fontSize:20,fontWeight:700,color:"var(--inv-text1)"}}>{user?.name}</p>
              <p style={{margin:"3px 0 6px",fontSize:13,color:"var(--inv-text3)"}}>{user?.email}</p>
              <span style={{
                display:"inline-block",
                background:C.goldBg, border:`1px solid ${C.goldBdr}`,
                color:C.gold, fontSize:10, fontWeight:800,
                padding:"3px 12px", borderRadius:20,
                letterSpacing:".1em", textTransform:"uppercase",
              }}>
                {user?.provider==="google"?"Google Account":"Email Account"}
              </span>
            </div>
          </div>

          {/* ── Edit profile ── */}
          <div style={card}>
            <h2 style={sectionTitle}>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <FloatInput label="Full Name" value={name} onChange={e=>setName(e.target.value)}/>
              <FloatInput label="Email address" value={user?.email||""} disabled/>
              <p style={{fontSize:11,color:"var(--inv-text4)",margin:"-8px 0 16px"}}>Email cannot be changed.</p>
              <StatusBox msg={profMsg}/>
              <GoldBtn type="submit" loading={profLoad}>
                {profLoad?"Saving…":"Save Changes"}
              </GoldBtn>
            </form>
          </div>

          {/* ── Saved GST / Seller Details ── */}
          <div style={card}>
            <h2 style={sectionTitle}>
              Seller GST Details
              <span style={{
                marginLeft:8, fontSize:10, color:"var(--inv-text4)", fontWeight:500,
                background:"rgba(255,255,255,.06)", border:`1px solid ${C.border}`,
                borderRadius:4, padding:"1px 8px", textTransform:"none", letterSpacing:0,
              }}>
                Auto-fills invoice seller section
              </span>
            </h2>
            <form onSubmit={handleGstSave}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <FloatInput label="Company Name"
                  value={gst.companyName}
                  onChange={e=>setGst(g=>({...g,companyName:e.target.value}))}/>
                <FloatInput label="GSTIN (15 digits)" mono
                  value={gst.gstin}
                  onChange={e=>setGst(g=>({...g,gstin:e.target.value.toUpperCase().slice(0,15)}))}/>
                <FloatInput label="PAN" mono
                  value={gst.pan}
                  onChange={e=>setGst(g=>({...g,pan:e.target.value.toUpperCase().slice(0,10)}))}/>
                <FloatInput label="State"
                  value={gst.state}
                  onChange={e=>setGst(g=>({...g,state:e.target.value}))}/>
              </div>
              <FloatInput label="Address"
                value={gst.address}
                onChange={e=>setGst(g=>({...g,address:e.target.value}))}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <FloatInput label="City"
                  value={gst.city}
                  onChange={e=>setGst(g=>({...g,city:e.target.value}))}/>
                <FloatInput label="PIN Code"
                  value={gst.zipCode}
                  onChange={e=>setGst(g=>({...g,zipCode:e.target.value}))}/>
              </div>
              <StatusBox msg={gstMsg}/>
              <GoldBtn type="submit">Save GST Details</GoldBtn>
            </form>
          </div>

          {/* ── Saved Bank Details ── */}
          <div style={card}>
            <h2 style={sectionTitle}>
              Bank Details
              <span style={{
                marginLeft:8, fontSize:10, color:"var(--inv-text4)", fontWeight:500,
                background:"rgba(255,255,255,.06)", border:`1px solid ${C.border}`,
                borderRadius:4, padding:"1px 8px", textTransform:"none", letterSpacing:0,
              }}>
                Auto-fills invoice bank section
              </span>
            </h2>
            <form onSubmit={handleBankSave}>
              <BankDropdown
                value={bank.bankName}
                onChange={v=>setBank(b=>({...b,bankName:v}))}
              />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <FloatInput label="Account Holder Name"
                  value={bank.accountHolder}
                  onChange={e=>setBank(b=>({...b,accountHolder:e.target.value}))}/>
                <FloatInput label="Account Number" mono
                  value={bank.accountNumber}
                  onChange={e=>setBank(b=>({...b,accountNumber:e.target.value}))}/>
                <FloatInput label="IFSC Code" mono
                  value={bank.ifsc}
                  onChange={e=>setBank(b=>({...b,ifsc:e.target.value.toUpperCase()}))}/>
                <FloatInput label="Branch"
                  value={bank.branch}
                  onChange={e=>setBank(b=>({...b,branch:e.target.value}))}/>
              </div>
              {/* Account type */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:9,fontWeight:800,color:"var(--inv-text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
                  Account Type
                </label>
                <div style={{display:"flex",gap:10}}>
                  {["Current","Savings"].map(t=>(
                    <button key={t} type="button" onClick={()=>setBank(b=>({...b,accountType:t}))}
                      style={{
                        padding:"9px 20px", borderRadius:10, cursor:"pointer",
                        border:`1.5px solid ${bank.accountType===t?C.goldBdr:C.border}`,
                        background:bank.accountType===t?C.goldBg:"transparent",
                        color:bank.accountType===t?C.gold:C.text3,
                        fontSize:13, fontWeight:600, fontFamily:"inherit",
                        transition:"all .18s",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <StatusBox msg={bankMsg}/>
              <GoldBtn type="submit">Save Bank Details</GoldBtn>
            </form>
          </div>

          {/* ── Change password (email users only) ── */}
          {user?.provider!=="google" && (
            <div style={card}>
              <h2 style={sectionTitle}>Change Password</h2>
              <form onSubmit={handlePasswordSave}>
                <div style={{position:"relative"}}>
                  <FloatInput label="Current Password" type={showPw?"text":"password"}
                    value={curPw} onChange={e=>setCurPw(e.target.value)}/>
                </div>
                <FloatInput label="New Password" type={showPw?"text":"password"}
                  value={newPw} onChange={e=>setNewPw(e.target.value)}/>
                <FloatInput label="Confirm New Password" type={showPw?"text":"password"}
                  value={confPw} onChange={e=>setConfPw(e.target.value)}/>
                <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,
                  fontSize:12,color:"var(--inv-text3)",cursor:"pointer"}}>
                  <input type="checkbox" checked={showPw} onChange={e=>setShowPw(e.target.checked)}
                    style={{cursor:"pointer"}}/>
                  Show passwords
                </label>
                <StatusBox msg={pwMsg}/>
                <GoldBtn type="submit" loading={pwLoad}>
                  {pwLoad?"Updating…":"Update Password"}
                </GoldBtn>
              </form>
            </div>
          )}

          {/* ── Sign out ── */}
          <div style={{...card, border:"1px solid rgba(248,113,113,.2)", marginBottom:0}}>
            <h2 style={{...sectionTitle, color:C.red}}>Sign Out</h2>
            <p style={{margin:"0 0 18px",fontSize:13,color:"var(--inv-text3)"}}>
              You will be redirected to the login page.
            </p>
            <button className="rbtn" onClick={handleLogout}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 24px", borderRadius:12, cursor:"pointer",
                border:"1.5px solid rgba(248,113,113,.2)",
                background:"rgba(248,113,113,.06)",
                color:"var(--inv-text2)", fontSize:13, fontWeight:600,
                fontFamily:"inherit", transition:"all .2s",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}