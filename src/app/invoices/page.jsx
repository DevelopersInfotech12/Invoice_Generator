"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../auth/components/AuthGuard";
import { invoiceApi } from "../auth/api/authApi";
import Link from "next/link";

const C = {
  bg:"#0E0C09", surface:"rgba(255,255,255,0.04)",
  border:"rgba(255,255,255,0.10)", gold:"#E8C97A",
  goldBg:"rgba(232,201,122,0.10)", goldBdr:"rgba(232,201,122,0.30)",
  white:"#FFFFFF", text1:"#F5F2EC", text2:"#D4CEC5",
  text3:"#9A9080", text4:"#5A5347", red:"#F87171", green:"#34D399",
};

function EmptyState() {
  return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{
        width:80, height:80, borderRadius:20, margin:"0 auto 20px",
        background:"rgba(232,201,122,.08)", border:"1px solid rgba(232,201,122,.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A8874A" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:C.text1 }}>
        No invoices yet
      </h3>
      <p style={{ margin:"0 0 24px", fontSize:14, color:C.text3 }}>
        Create your first invoice and save it to access it here.
      </p>
      <Link href="/" style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"12px 24px", borderRadius:12, textDecoration:"none",
        background:"linear-gradient(135deg,#E8C97A,#B8913A)",
        color:"#1A1008", fontSize:13, fontWeight:800,
        boxShadow:"0 4px 18px rgba(232,201,122,.28)",
      }}>
        + Create Invoice
      </Link>
    </div>
  );
}

function InvoiceCard({ invoice, onDelete, deleting }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const date = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
    : "—";

  const total = invoice.total
    ? `₹${Number(invoice.total).toLocaleString("en-IN",{minimumFractionDigits:2})}`
    : "₹0.00";

  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:16, padding:"20px 22px",
      transition:"border-color .2s, transform .2s, box-shadow .2s",
      animation:"ifadeup .3s ease both",
      position:"relative", overflow:"hidden",
    }}
      onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(232,201,122,.3)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.3)"; }}
      onMouseOut={e=>{  e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Top accent line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
        background:"linear-gradient(90deg,transparent,rgba(232,201,122,.4),transparent)" }}/>

      {/* Badge */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <span style={{
          display:"inline-flex", alignItems:"center",
          background:C.goldBg, border:`1px solid ${C.goldBdr}`,
          color:C.gold, fontSize:10, fontWeight:800,
          padding:"3px 10px", borderRadius:20, letterSpacing:".1em",
          textTransform:"uppercase",
        }}>
          {invoice.isProforma ? "Proforma" : "Tax Invoice"}
        </span>
        <span style={{ fontSize:11, color:C.text4 }}>{date}</span>
      </div>

      {/* Invoice number + buyer */}
      <h3 style={{ margin:"0 0 4px", fontSize:16, fontWeight:700, color:C.text1 }}>
        {invoice.invoiceNumber || "Untitled Invoice"}
      </h3>
      <p style={{ margin:"0 0 16px", fontSize:13, color:C.text3 }}>
        {invoice.to?.name || "No buyer specified"}
      </p>

      {/* Total */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        paddingTop:14, borderTop:"1px solid rgba(255,255,255,.06)",
      }}>
        <span style={{ fontSize:20, fontWeight:800, color:C.gold,
          fontVariantNumeric:"tabular-nums" }}>
          {total}
        </span>

        {/* Actions */}
        <div style={{ display:"flex", gap:8 }}>
          {confirmDelete ? (
            <>
              <button onClick={()=>setConfirmDelete(false)}
                style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`,
                  background:"transparent", color:C.text3, fontSize:12, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
              <button onClick={()=>{ onDelete(invoice._id); setConfirmDelete(false); }}
                disabled={deleting}
                style={{ padding:"7px 14px", borderRadius:8, border:"1px solid rgba(248,113,113,.3)",
                  background:"rgba(248,113,113,.1)", color:C.red, fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit" }}>
                {deleting ? "Deleting…" : "Confirm"}
              </button>
            </>
          ) : (
            <>
              {/* Edit */}
              <button onClick={()=>router.push(`/invoices/${invoice._id}`)}
                style={{ padding:"7px 14px", borderRadius:8,
                  background:C.goldBg, border:`1px solid ${C.goldBdr}`,
                  color:C.gold, fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit", transition:"all .2s",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              {/* Delete */}
              <button onClick={()=>setConfirmDelete(true)}
                style={{ padding:"7px 12px", borderRadius:8,
                  background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)",
                  color:C.text3, fontSize:12, cursor:"pointer",
                  transition:"all .2s", display:"flex", alignItems:"center",
                }}
                onMouseOver={e=>{ e.currentTarget.style.color=C.red; e.currentTarget.style.borderColor="rgba(248,113,113,.4)"; }}
                onMouseOut={e=>{  e.currentTarget.style.color=C.text3; e.currentTarget.style.borderColor="rgba(248,113,113,.2)"; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoicesContent() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, ok=true) => {
    setToast({msg,ok});
    setTimeout(()=>setToast(null),3000);
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.getAll({ page, limit:9, search });
      setInvoices(data.invoices || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(()=>{ loadInvoices(); },[loadInvoices]);

  /* Debounce search */
  const [searchInput, setSearchInput] = useState("");
  useEffect(()=>{
    const t = setTimeout(()=>{ setSearch(searchInput); setPage(1); }, 400);
    return ()=>clearTimeout(t);
  },[searchInput]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await invoiceApi.delete(id);
      showToast("Invoice deleted.");
      loadInvoices();
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      backgroundImage:`
        radial-gradient(ellipse 70% 45% at 15% -5%,rgba(232,201,122,.06) 0%,transparent 60%),
        radial-gradient(ellipse 55% 40% at 85% 105%,rgba(147,51,234,.04) 0%,transparent 55%)
      `,
      padding:"40px 20px 80px",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        @keyframes ifadeup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes islidedown{from{opacity:0;transform:translateY(-14px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:22, left:"50%", zIndex:9999, transform:"translateX(-50%)",
          animation:"islidedown .32s ease both",
          display:"flex", alignItems:"center", gap:10,
          background: toast.ok?"#081A10":"#1A0808",
          border:`1px solid ${toast.ok?"rgba(52,211,153,.4)":"rgba(248,113,113,.4)"}`,
          borderRadius:14, padding:"12px 22px",
          color: toast.ok ? C.green : C.red,
          fontSize:13, fontWeight:600,
          boxShadow:"0 12px 40px rgba(0,0,0,.75)",
        }}>
          <span style={{fontSize:15}}>{toast.ok?"✓":"✕"}</span>{toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1160, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:16, marginBottom:36,
          animation:"ifadeup .4s ease both",
        }}>
          <div>
            <h1 style={{
              margin:0, fontFamily:"'DM Serif Display',serif",
              fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:400,
              color:C.white, letterSpacing:"-.01em",
            }}>
              My Invoices
            </h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:C.text3 }}>
              All your saved invoices in one place
            </p>
          </div>
          <Link href="/" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"11px 22px", borderRadius:12, textDecoration:"none",
            background:"linear-gradient(135deg,#E8C97A,#B8913A)",
            color:"#1A1008", fontSize:13, fontWeight:800,
            boxShadow:"0 4px 18px rgba(232,201,122,.28)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Invoice
          </Link>
        </div>

        {/* ── Search ── */}
        <div style={{ position:"relative", marginBottom:28 }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text4} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search by invoice number or buyer name…"
            value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            style={{
              width:"100%", boxSizing:"border-box",
              background:C.surface, border:`1.5px solid ${C.border}`,
              borderRadius:14, padding:"13px 16px 13px 46px",
              fontSize:14, color:C.text1, fontFamily:"inherit", outline:"none",
              transition:"border-color .2s",
            }}
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor=C.border}
          />
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{
              width:44, height:44, borderRadius:"50%", margin:"0 auto 16px",
              border:"3px solid rgba(232,201,122,.15)", borderTopColor:C.gold,
              animation:"spin .7s linear infinite",
            }}/>
            <p style={{ color:C.text3, fontSize:13 }}>Loading invoices…</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState/>
        ) : (
          <>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",
              gap:18, marginBottom:32,
            }}>
              {invoices.map((inv,i)=>(
                <div key={inv._id} style={{ animationDelay:`${i*.05}s` }}>
                  <InvoiceCard
                    invoice={inv}
                    onDelete={handleDelete}
                    deleting={deleting===inv._id}
                  />
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:`1px solid ${C.border}`, background:"transparent",
                    color:page===1?C.text4:C.text2, fontSize:13, fontFamily:"inherit",
                    opacity:page===1?.5:1 }}>
                  ← Prev
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer",
                      border:`1px solid ${p===page?C.goldBdr:C.border}`,
                      background:p===page?C.goldBg:"transparent",
                      color:p===page?C.gold:C.text2,
                      fontSize:13, fontWeight:p===page?700:400, fontFamily:"inherit" }}>
                    {p}
                  </button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:`1px solid ${C.border}`, background:"transparent",
                    color:page===totalPages?C.text4:C.text2, fontSize:13, fontFamily:"inherit",
                    opacity:page===totalPages?.5:1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <AuthGuard redirectTo="/login">
      <InvoicesContent />
    </AuthGuard>
  );
}