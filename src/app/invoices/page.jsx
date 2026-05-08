"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../auth/components/AuthGuard";
import { invoiceApi } from "../auth/api/authApi";
import Link from "next/link";

function EmptyState() {
  return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{
        width:80, height:80, borderRadius:20, margin:"0 auto 20px",
        background:"var(--inv-card-bg)", border:"1px solid var(--inv-card-border)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A8874A" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:"var(--inv-text1)" }}>
        No invoices yet
      </h3>
      <p style={{ margin:"0 0 24px", fontSize:14, color:"var(--inv-text3)" }}>
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

function InvoiceCard({ invoice, onDelete, deleting, pinned, onPin, onDownload }) {
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
      background:"var(--inv-card-bg)",
      border:`1px solid ${pinned ? "rgba(232,201,122,.45)" : "var(--inv-card-border)"}`,
      borderRadius:16, padding:"20px 18px 18px 18px",
      transition:"border-color .2s, transform .2s, box-shadow .2s",
      animation:"ifadeup .3s ease both",
      position:"relative", overflow:"hidden",
      display:"inline-block", width:"100%", boxSizing:"border-box",
      boxShadow:"var(--inv-card-shadow)",
    }}
      onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(232,201,122,.3)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.15)"; }}
      onMouseOut={e=>{ e.currentTarget.style.borderColor= pinned ? "rgba(232,201,122,.45)" : "var(--inv-card-border)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="var(--inv-card-shadow)"; }}
    >
      {/* Top accent line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
        background: pinned
          ? "linear-gradient(90deg,transparent,rgba(232,201,122,.8),transparent)"
          : "linear-gradient(90deg,transparent,rgba(232,201,122,.4),transparent)" }}/>

      {/* Badge + Date/Pinned right column */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <span style={{
          display:"inline-flex", alignItems:"center",
          background:"rgba(232,201,122,0.10)", border:"1px solid rgba(232,201,122,0.30)",
          color:"#e4a60b", fontSize:10, fontWeight:800,
          padding:"3px 10px", borderRadius:20, letterSpacing:".1em",
          textTransform:"uppercase",
        }}>
          {invoice.isProforma ? "Proforma" : "Tax Invoice"}
        </span>

        {/* Right column: date on top, pinned badge below */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <span style={{ fontSize:11, color:"var(--inv-text1)" }}>{date}</span>
          {pinned && (
            <span style={{
              background:"rgba(232,201,122,.15)", border:"1px solid rgba(232,201,122,.3)",
              borderRadius:6, padding:"2px 8px",
              fontSize:9, color:"#E8C97A", fontWeight:800, letterSpacing:".08em",
              textTransform:"uppercase",
            }}>
              📌 Pinned
            </span>
          )}
        </div>
      </div>

      {/* Invoice number + buyer */}
      <h3 style={{ margin:"0 0 4px", fontSize:16, fontWeight:700, color:"var(--inv-text1)" }}>
        {invoice.invoiceNumber || "Untitled Invoice"}
      </h3>
      <p style={{ margin:"0 0 16px", fontSize:13, fontWeight:800, color:"var(--inv-text3)" }}>
        {invoice.to?.name || "No buyer specified"}
      </p>

      {/* Total + Actions */}
      <div style={{
        display:"flex", flexDirection:"column", gap:12,
        paddingTop:14, borderTop:"1px solid var(--inv-border)",
      }}>
        <span style={{ fontSize:20, fontWeight:800, color:"#ebae16", fontVariantNumeric:"tabular-nums" }}>
          {total}
        </span>

        <div style={{ display:"flex", gap:6, width:"fit-content" }}>
          {confirmDelete ? (
            <>
              <button onClick={()=>setConfirmDelete(false)}
                style={{ padding:"7px 14px", borderRadius:8, border:"1px solid var(--inv-border)",
                  background:"transparent", color:"var(--inv-text3)", fontSize:12, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
              <button onClick={()=>{ onDelete(invoice._id); setConfirmDelete(false); }}
                disabled={deleting}
                style={{ padding:"7px 14px", borderRadius:8, border:"1px solid rgba(248,113,113,.3)",
                  background:"rgba(248,113,113,.1)", color:"#F87171", fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit" }}>
                {deleting ? "Deleting…" : "Confirm"}
              </button>
            </>
          ) : (
            <>
              {/* Pin button */}
              <button
                onClick={() => onPin(invoice._id)}
                title={pinned ? "Unpin invoice" : "Pin invoice"}
                style={{
                  padding:"7px 10px", borderRadius:8,
                  background: pinned ? "rgba(232,201,122,.15)" : "transparent",
                  border: pinned ? "1px solid rgba(232,201,122,.4)" : "1px solid var(--inv-border)",
                  color: pinned ? "#E8C97A" : "var(--inv-text3)",
                  fontSize:14, cursor:"pointer",
                  transition:"all .2s", display:"flex", alignItems:"center",
                }}
                onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(232,201,122,.4)"; e.currentTarget.style.color="#E8C97A"; }}
                onMouseOut={e=>{
                  e.currentTarget.style.borderColor = pinned ? "rgba(232,201,122,.4)" : "var(--inv-border)";
                  e.currentTarget.style.color = pinned ? "#E8C97A" : "var(--inv-text3)";
                }}
              >
                📌
              </button>

              {/* Download button */}
              <button
                onClick={() => onDownload(invoice._id)}
                title="Download invoice as PDF"
                style={{
                  padding:"7px 12px", borderRadius:8,
                  background:"rgba(232,201,122,.08)", border:"1px solid rgba(232,201,122,.25)",
                  color:"var(--inv-text3)", fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit",
                  transition:"all .2s", display:"flex", alignItems:"center", gap:5,
                }}
                onMouseOver={e=>{ e.currentTarget.style.color="#E8C97A"; e.currentTarget.style.borderColor="rgba(232,201,122,.4)"; e.currentTarget.style.background="rgba(232,201,122,.15)"; }}
                onMouseOut={e=>{ e.currentTarget.style.color="var(--inv-text3)"; e.currentTarget.style.borderColor="rgba(232,201,122,.25)"; e.currentTarget.style.background="rgba(232,201,122,.08)"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>

              {/* Edit button */}
              <button onClick={()=>router.push(`/invoices/${invoice._id}`)}
                style={{ padding:"7px 14px", borderRadius:8,
                  background:"rgba(232,201,122,0.10)", border:"1px solid rgba(232,201,122,0.30)",
                  color:"#E8C97A", fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit", transition:"all .2s",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>

              {/* Delete button */}
              <button onClick={()=>setConfirmDelete(true)}
                style={{ padding:"7px 12px", borderRadius:8,
                  background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)",
                  color:"var(--inv-text3)", fontSize:12, cursor:"pointer",
                  transition:"all .2s", display:"flex", alignItems:"center",
                }}
                onMouseOver={e=>{ e.currentTarget.style.color="#F87171"; e.currentTarget.style.borderColor="rgba(248,113,113,.4)"; }}
                onMouseOut={e=>{ e.currentTarget.style.color="var(--inv-text3)"; e.currentTarget.style.borderColor="rgba(248,113,113,.2)"; }}>
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
  const [invoices, setInvoices]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [deleting, setDeleting]     = useState(null);
  const [search,   setSearch]       = useState("");
  const [page,     setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast,    setToast]        = useState(null);
  const [pinnedIds, setPinnedIds]   = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("pinnedInvoices") || "[]");
      setPinnedIds(stored);
    } catch { setPinnedIds([]); }
  }, []);

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
      const updated = pinnedIds.filter(pid => pid !== id);
      setPinnedIds(updated);
      localStorage.setItem("pinnedInvoices", JSON.stringify(updated));
      loadInvoices();
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setDeleting(null);
    }
  };

  const handlePin = (id) => {
    setPinnedIds(prev => {
      const isPinned = prev.includes(id);
      const updated = isPinned ? prev.filter(pid => pid !== id) : [id, ...prev];
      localStorage.setItem("pinnedInvoices", JSON.stringify(updated));
      showToast(isPinned ? "Invoice unpinned." : "Invoice pinned!");
      return updated;
    });
  };

  const handleDownload = (id) => {
    router.push(`/invoices/${id}?print=1`);
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    const aPinned = pinnedIds.includes(a._id);
    const bPinned = pinnedIds.includes(b._id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const pinnedCount = sortedInvoices.filter(inv => pinnedIds.includes(inv._id)).length;

  return (
    <div style={{
      minHeight:"100vh",
      background:"var(--inv-bg)",
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
          background:"var(--inv-section-bg)",
          border:`1px solid ${toast.ok ? "rgba(52,211,153,.4)" : "rgba(248,113,113,.4)"}`,
          borderRadius:14, padding:"12px 22px",
          color: toast.ok ? "#34D399" : "#F87171",
          fontSize:13, fontWeight:600,
          boxShadow:"0 12px 40px rgba(0,0,0,.2)",
        }}>
          <span style={{fontSize:15}}>{toast.ok?"✓":"✕"}</span>{toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1160, margin:"0 auto" }}>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:16, marginBottom:36,
          animation:"ifadeup .4s ease both",
        }}>
          <div>
            <h1 style={{
              margin:0,
              fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:700,
              color:"var(--inv-text1)", letterSpacing:"-.01em",
            }}>
              My Invoices
            </h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--inv-text3)" }}>
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

        {/* Search */}
        <div style={{ position:"relative", marginBottom:28 }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search by invoice number or buyer name…"
            value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            style={{
              width:"100%", boxSizing:"border-box",
              background:"var(--inv-input-bg)",
              border:"1.5px solid var(--inv-input-border)",
              borderRadius:14, padding:"13px 16px 13px 46px",
              fontSize:14, color:"var(--inv-text1)", fontFamily:"inherit", outline:"none",
              transition:"border-color .2s",
            }}
            onFocus={e=>e.target.style.borderColor="#E8C97A"}
            onBlur={e=>e.target.style.borderColor="var(--inv-input-border)"}
          />
        </div>

        {/* Pinned section label */}
        {!loading && pinnedCount > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingLeft:2 }}>
            <span style={{ fontSize:11, color:"#E8C97A", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>
              📌 Pinned
            </span>
            <div style={{ flex:1, height:1, background:"rgba(232,201,122,.15)" }}/>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{
              width:44, height:44, borderRadius:"50%", margin:"0 auto 16px",
              border:"3px solid var(--inv-border)", borderTopColor:"#E8C97A",
              animation:"spin .7s linear infinite",
            }}/>
            <p style={{ color:"var(--inv-text3)", fontSize:13 }}>Loading invoices…</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState/>
        ) : (
          <>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),max-content))",
              gap:18, marginBottom:32,
            }}>
              {sortedInvoices.map((inv, i) => {
                const isPinned     = pinnedIds.includes(inv._id);
                const prevIsPinned = i > 0 ? pinnedIds.includes(sortedInvoices[i-1]._id) : true;
                const showDivider  = pinnedCount > 0 && !isPinned && prevIsPinned;

                return (
                  <React.Fragment key={inv._id}>
                    {showDivider && (
                      <div style={{
                        gridColumn:"1 / -1",
                        display:"flex", alignItems:"center", gap:8,
                        marginTop:8, marginBottom:4, paddingLeft:2,
                      }}>
                        <span style={{ fontSize:11, color:"var(--inv-text4)", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>
                          Others
                        </span>
                        <div style={{ flex:1, height:1, background:"var(--inv-border)" }}/>
                      </div>
                    )}
                    <div style={{ animationDelay:`${i*.05}s`, width:"fit-content" }}>
                      <InvoiceCard
                        invoice={inv}
                        onDelete={handleDelete}
                        deleting={deleting===inv._id}
                        pinned={isPinned}
                        onPin={handlePin}
                        onDownload={handleDownload}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid var(--inv-border)", background:"transparent",
                    color:page===1?"var(--inv-text4)":"var(--inv-text2)",
                    fontSize:13, fontFamily:"inherit", opacity:page===1?.5:1 }}>
                  ← Prev
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer",
                      border:`1px solid ${p===page?"rgba(232,201,122,0.30)":"var(--inv-border)"}`,
                      background:p===page?"rgba(232,201,122,0.10)":"transparent",
                      color:p===page?"#E8C97A":"var(--inv-text2)",
                      fontSize:13, fontWeight:p===page?700:400, fontFamily:"inherit" }}>
                    {p}
                  </button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid var(--inv-border)", background:"transparent",
                    color:page===totalPages?"var(--inv-text4)":"var(--inv-text2)",
                    fontSize:13, fontFamily:"inherit", opacity:page===totalPages?.5:1 }}>
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