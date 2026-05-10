"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../auth/components/AuthGuard";
import { invoiceApi } from "../auth/api/authApi";
import Link from "next/link";

/* ── All colours via CSS variables — theme-aware ── */
const C = {
  bg:           "var(--inv-bg)",
  surface:      "var(--inv-surface)",
  surfaceHover: "var(--inv-surface-hover)",
  border:       "var(--inv-border)",
  gold:         "#E8C97A",
  goldBg:       "rgba(232,201,122,0.10)",
  goldBdr:      "rgba(232,201,122,0.30)",
  text1:        "var(--inv-text1)",
  text2:        "var(--inv-text2)",
  text3:        "var(--inv-text3)",
  text4:        "var(--inv-text4)",
  red:          "#F87171",
  green:        "#34D399",
  blue:         "#60A5FA",
  purple:       "#A78BFA",
};

/* ── Empty state ── */
function EmptyState({ hasFilter, onClear }) {
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
      {hasFilter ? (
        <>
          <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:C.text1 }}>No invoices match</h3>
          <p style={{ margin:"0 0 24px", fontSize:14, color:C.text3 }}>Try a different search or filter.</p>
          <button onClick={onClear} style={{
            padding:"10px 20px", borderRadius:10, border:"1px solid var(--inv-border)",
            background:"transparent", color:C.text2, fontSize:13, cursor:"pointer", fontFamily:"inherit",
          }}>Clear filters</button>
        </>
      ) : (
        <>
          <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:C.text1 }}>No invoices yet</h3>
          <p style={{ margin:"0 0 24px", fontSize:14, color:C.text3 }}>Create your first invoice and save it to see it here.</p>
          <Link href="/" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"12px 24px", borderRadius:12, textDecoration:"none",
            background:"linear-gradient(135deg,#E8C97A,#B8913A)",
            color:"#1A1008", fontSize:13, fontWeight:800,
            boxShadow:"0 4px 18px rgba(232,201,122,.28)",
          }}>+ Create Invoice</Link>
        </>
      )}
    </div>
  );
}

/* ── Row card ── */
function InvoiceRow({ invoice, serial, onDelete, onDuplicate, onPin, onDownload, onBuyerClick, deleting, duplicating, pinning, downloading }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const date = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "—";

  const total = invoice.total
    ? "₹" + Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits:2 })
    : "₹0.00";

  const baseBtn = {
    display:"inline-flex", alignItems:"center", gap:6,
    padding:"7px 13px", borderRadius:8, fontSize:12,
    fontWeight:600, cursor:"pointer", fontFamily:"inherit",
    border:"none", transition:"all .18s", whiteSpace:"nowrap",
  };

  return (
    <div
      className="inv-row-card"
      style={{
        display:"grid",
        gridTemplateColumns:"38px 1fr 1fr 1fr auto",
        alignItems:"center",
        gap:14,
        background: invoice.isPinned ? "rgba(232,201,122,0.05)" : C.surface,
        border:"1px solid " + (invoice.isPinned ? "rgba(232,201,122,0.28)" : C.border),
        borderRadius:14,
        padding:"16px 20px",
        position:"relative",
        overflow:"hidden",
        animation:"ifadeup .28s ease both",
        transition:"border-color .2s, box-shadow .2s",
      }}
    >
      {/* Top accent */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background: invoice.isPinned
          ? "linear-gradient(90deg,transparent,rgba(232,201,122,.6),transparent)"
          : "linear-gradient(90deg,transparent,rgba(232,201,122,.2),transparent)",
      }}/>

      {/* Serial + pin icon */}
      <div style={{ textAlign:"center", flexShrink:0 }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.text4, fontVariantNumeric:"tabular-nums" }}>
          #{serial}
        </span>
        {invoice.isPinned && (
          <div style={{ marginTop:3, fontSize:11 }}>📌</div>
        )}
      </div>

      {/* Invoice info */}
      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <span style={{
            display:"inline-flex", alignItems:"center",
            background:C.goldBg, border:"1px solid " + C.goldBdr,
            color:C.gold, fontSize:9, fontWeight:800,
            padding:"2px 8px", borderRadius:20,
            letterSpacing:".1em", textTransform:"uppercase", flexShrink:0,
          }}>
            {invoice.isProforma ? "Proforma" : "Tax Invoice"}
          </span>
          <span style={{ fontSize:11, color:C.text4 }}>{date}</span>
        </div>
        <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.text1,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {invoice.invoiceNumber || "Untitled Invoice"}
        </p>
        <p style={{ margin:"2px 0 0", fontSize:12, color:C.text3,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {invoice.to?.name || "No buyer specified"}
        </p>
      </div>

      {/* Buyer — clickable filter */}
      <div className="inv-col-buyer" style={{ minWidth:0 }}>
        <p style={{ margin:"0 0 3px", fontSize:11, color:C.text4, textTransform:"uppercase",
          letterSpacing:".06em", fontWeight:700 }}>Buyer</p>
        {invoice.to?.name ? (
          <button
            onClick={() => onBuyerClick(invoice.to.name)}
            title={"Filter by buyer: " + invoice.to.name}
            style={{
              background:"none", border:"none", padding:0, cursor:"pointer",
              fontSize:13, color:C.blue, fontWeight:500, fontFamily:"inherit",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              maxWidth:"100%", display:"block", textAlign:"left",
              textDecoration:"underline", textDecorationColor:"rgba(96,165,250,.35)",
            }}
          >
            {invoice.to.name}
          </button>
        ) : (
          <p style={{ margin:0, fontSize:13, color:C.text4 }}>—</p>
        )}
      </div>

      {/* Total */}
      <div>
        <p style={{ margin:"0 0 3px", fontSize:11, color:C.text4, textTransform:"uppercase",
          letterSpacing:".06em", fontWeight:700 }}>Total</p>
        <p style={{ margin:0, fontSize:18, fontWeight:800, color:C.gold, fontVariantNumeric:"tabular-nums" }}>
          {total}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0, flexWrap:"wrap" }}>
        {confirmDelete ? (
          <>
            <button onClick={()=>setConfirmDelete(false)}
              style={{ ...baseBtn, background:C.surface, color:C.text3,
                border:"1px solid " + C.border }}>Cancel</button>
            <button onClick={()=>{ onDelete(invoice._id); setConfirmDelete(false); }}
              disabled={deleting}
              style={{ ...baseBtn, background:"rgba(248,113,113,.15)", color:C.red,
                border:"1px solid rgba(248,113,113,.3)" }}>
              {deleting ? "Deleting…" : "Confirm Delete"}
            </button>
          </>
        ) : (
          <>
            {/* Pin */}
            <button onClick={() => onPin(invoice._id)} disabled={pinning}
              title={invoice.isPinned ? "Unpin" : "Pin to top"}
              style={{ ...baseBtn, padding:"7px 10px",
                background: invoice.isPinned ? "rgba(232,201,122,.15)" : C.surface,
                color: invoice.isPinned ? C.gold : C.text4,
                border:"1px solid " + (invoice.isPinned ? C.goldBdr : C.border) }}>
              {pinning ? "…" : (invoice.isPinned ? "📌" : "📍")}
            </button>

            {/* Download PDF */}
            <button onClick={() => onDownload(invoice._id)} disabled={downloading}
              title="Download PDF"
              style={{ ...baseBtn, background:"rgba(167,139,250,.10)", color:C.purple,
                border:"1px solid rgba(167,139,250,.25)" }}>
              {downloading
                ? <><SpinIcon color={C.purple}/> Preparing…</>
                : <><DownloadIcon/> PDF</>}
            </button>

            {/* Edit */}
            <button onClick={()=>router.push("/invoices/" + invoice._id)}
              className="inv-btn-edit"
              style={{ ...baseBtn, background:C.goldBg, color:C.gold, border:"1px solid " + C.goldBdr }}>
              <EditIcon/> Edit
            </button>

            {/* Duplicate */}
            <button onClick={()=>onDuplicate(invoice)} disabled={duplicating}
              className="inv-btn-dup"
              style={{ ...baseBtn, background:"rgba(96,165,250,.10)", color:C.blue,
                border:"1px solid rgba(96,165,250,.25)" }}>
              {duplicating
                ? <><SpinIcon color={C.blue}/> Copying…</>
                : <><CopyIcon/> Duplicate</>}
            </button>

            {/* Delete */}
            <button onClick={()=>setConfirmDelete(true)} className="inv-btn-del"
              style={{ ...baseBtn, padding:"7px 10px",
                background:"rgba(248,113,113,.08)", color:C.text3,
                border:"1px solid rgba(248,113,113,.18)" }}>
              <TrashIcon/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Small icon components ── */
const SpinIcon = ({ color="#fff" }) => (
  <span style={{ display:"inline-block", width:11, height:11,
    border:"2px solid " + color + "44", borderTopColor:color,
    borderRadius:"50%", animation:"ispin .7s linear infinite" }}/>
);
const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

/* ── Main page ── */
function InvoicesContent() {
  const router = useRouter();
  const [invoices,    setInvoices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [pinning,     setPinning]     = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [search,      setSearch]      = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [dateFilter,    setDateFilter]    = useState("");   // "YYYY-MM-DD"
  const [monthFilter,   setMonthFilter]   = useState("");   // "YYYY-MM"
  const [selMonth, setSelMonth] = useState(String(new Date().getMonth()+1).padStart(2,"0"));
  const [selYear,  setSelYear]  = useState(String(new Date().getFullYear()));
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [toast,       setToast]       = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [allBuyers,   setAllBuyers]   = useState([]);

  const showToast = (msg, ok=true) => {
    setToast({ msg, ok });
    setTimeout(()=>setToast(null), 3200);
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.getAll({ page, limit:10, search });
      let list = data.invoices || [];
      if (buyerFilter) {
        list = list.filter(inv =>
          (inv.to?.name || "").toLowerCase().includes(buyerFilter.toLowerCase())
        );
      }
      if (dateFilter) {
        list = list.filter(inv => (inv.date || "").startsWith(dateFilter));
      }
      if (monthFilter) {
        list = list.filter(inv => (inv.date || "").startsWith(monthFilter));
      }
      setInvoices(list);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      // Collect unique buyer names for dropdown
      const buyers = [...new Set(
        (data.invoices || []).map(inv => inv.to?.name).filter(Boolean)
      )].sort();
      setAllBuyers(buyers);
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setLoading(false);
    }
  }, [page, search, buyerFilter, dateFilter, monthFilter]);

  useEffect(()=>{ loadInvoices(); }, [loadInvoices]);

  // Debounce search
  useEffect(()=>{
    const t = setTimeout(()=>{ setSearch(searchInput); setPage(1); }, 400);
    return ()=>clearTimeout(t);
  }, [searchInput]);

  // Sync month+year selects → monthFilter (fires on mount with defaults too)
  useEffect(()=>{
    if (selYear && selMonth) {
      setMonthFilter(selYear + "-" + selMonth);
      setPage(1);
    } else {
      setMonthFilter("");
    }
  }, [selMonth, selYear]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try { await invoiceApi.delete(id); showToast("Invoice deleted."); loadInvoices(); }
    catch (err) { showToast(err.message, false); }
    finally { setDeleting(null); }
  };

  const handlePin = async (id) => {
    setPinning(id);
    try {
      const data = await invoiceApi.togglePin(id);
      showToast(data.isPinned ? "📌 Pinned to top." : "Unpinned.");
      setInvoices(prev => {
        const updated = prev.map(inv => inv._id === id ? { ...inv, isPinned: data.isPinned } : inv);
        return [...updated].sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      });
    } catch (err) { showToast(err.message || "Failed to pin.", false); }
    finally { setPinning(null); }
  };

  const handleDownload = (id) => {
    setDownloading(id);
    window.open("/invoices/" + id + "?print=1", "_blank");
    setTimeout(() => setDownloading(null), 2000);
  };

  const handleDuplicate = async (invoice) => {
    setDuplicating(invoice._id);
    try {
      const fullData = await invoiceApi.getOne(invoice._id);
      const full = fullData.invoice;
      const { _id, __v, createdAt, updatedAt, user, ...rest } = full;
      const data = await invoiceApi.create({
        ...rest,
        invoiceNumber: rest.invoiceNumber ? rest.invoiceNumber + "-COPY" : "COPY",
        isPinned: false,
      });
      showToast("Duplicated! Opening copy…");
      setTimeout(() => router.push("/invoices/" + data.invoice._id), 700);
    } catch (err) { showToast(err.message || "Failed to duplicate.", false); }
    finally { setDuplicating(null); }
  };

  const handleBuyerClick = (name) => {
    setBuyerFilter(name);
    setPage(1);
    showToast("Filtered by buyer: " + name);
  };

  const clearFilters = () => {
    setBuyerFilter("");
    setDateFilter("");
    setSelMonth(String(new Date().getMonth()+1).padStart(2,"0"));
    setSelYear(String(new Date().getFullYear()));
    setSearchInput(""); setSearch("");
    setPage(1);
  };

  const hasFilter = !!(search || buyerFilter || dateFilter || monthFilter);
  const hasPinned   = invoices.some(inv => inv.isPinned);
  const hasUnpinned = invoices.some(inv => !inv.isPinned);

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      backgroundImage:"radial-gradient(ellipse 70% 45% at 15% -5%,var(--inv-grad1) 0%,transparent 60%),radial-gradient(ellipse 55% 40% at 85% 105%,var(--inv-grad2) 0%,transparent 55%)",
      padding:"40px 20px 80px", fontFamily:"'DM Sans',sans-serif",
      color:C.text1,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        @keyframes ifadeup    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes islidedown { from{opacity:0;transform:translateY(-14px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes ispin      { to{transform:rotate(360deg)} }
        .inv-row-card:hover   { border-color:rgba(232,201,122,.35)!important; box-shadow:0 4px 28px rgba(0,0,0,.12)!important; }
        .inv-btn-edit:hover   { background:rgba(232,201,122,.22)!important; }
        .inv-btn-dup:hover    { background:rgba(96,165,250,.22)!important; }
        .inv-btn-del:hover    { background:rgba(248,113,113,.2)!important; color:#F87171!important; border-color:rgba(248,113,113,.45)!important; }

        /* ── Shared input base ── */
        .inv-filter-input {
          background: var(--inv-surface) !important;
          color: var(--inv-text1) !important;
          border: 1.5px solid var(--inv-border) !important;
          border-radius: 12px;
          font-size: 13px;
          font-family: inherit;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
          height: 46px;
          box-sizing: border-box;
        }
        .inv-filter-input:focus {
          border-color: #E8C97A !important;
          box-shadow: 0 0 0 3px rgba(232,201,122,.12) !important;
        }
        .inv-filter-input::placeholder { color: var(--inv-text4) !important; }
        .inv-filter-input option {
          background: var(--inv-surface);
          color: var(--inv-text1);
        }

        /* Search */
        .inv-search-input {
          width: 100%;
          padding: 0 14px 0 40px;
        }

        /* Buyer select dropdown */
        .inv-buyer-select {
          min-width: 160px;
          max-width: 260px;
          width: auto;
          padding: 0 32px 0 36px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }
        .inv-buyer-select:focus { border-color: #E8C97A !important; box-shadow: 0 0 0 3px rgba(232,201,122,.12) !important; }

        /* Date / Month selects — labelled wrapper */
        .inv-date-wrap {
          flex-shrink: 0;
          display: flex; flex-direction: column; gap: 3px;
        }
        .inv-date-label {
          font-size: 9px; font-weight: 800; letter-spacing: .1em;
          text-transform: uppercase; color: var(--inv-text4);
          padding-left: 4px; line-height: 1;
        }
        .inv-date-row { display: flex; gap: 4px; }
        .inv-sel {
          height: 46px;
          padding: 0 28px 0 12px;
          cursor: pointer;
          appearance: none; -webkit-appearance: none;
          background: var(--inv-surface) !important;
          color: var(--inv-text1) !important;
          border: 1.5px solid var(--inv-border) !important;
          border-radius: 10px;
          font-size: 13px; font-family: inherit;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .inv-sel:focus { border-color: #E8C97A !important; box-shadow: 0 0 0 3px rgba(232,201,122,.12) !important; }
        .inv-sel option { background: var(--inv-surface); color: var(--inv-text1); }
        .inv-sel-month { width: 120px; }
        .inv-sel-year  { width: 88px; }
        .inv-sel-day   { width: 76px; }

        /* Divider between filter fields */
        .inv-filter-divider {
          width: 1px; height: 26px; flex-shrink: 0;
          background: var(--inv-border);
          opacity: 0.6;
          margin-bottom: 10px;
        }

        /* Active filter pills */
        .inv-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
        }
        .inv-pill-close {
          background: none; border: none; cursor: pointer;
          font-size: 15px; padding: 0 2px; line-height: 1; margin-left: 2px;
          opacity: 0.6;
        }
        .inv-pill-close:hover { opacity: 1; }

        /* Responsive */
        .inv-filter-row { flex-wrap: wrap; }
        @media(max-width: 900px) {
          .inv-filter-row { flex-direction: column !important; align-items: stretch !important; }
          .inv-buyer-select { width: 100% !important; max-width: 100% !important; }
          .inv-date-wrap { width: 100%; }
          .inv-filter-divider { display: none !important; }
        }
        @media(max-width:1050px){ .inv-row-card{ grid-template-columns:38px 1fr 1fr auto!important; } .inv-col-total{ display:none!important; } }
        @media(max-width:760px) { .inv-row-card{ grid-template-columns:38px 1fr auto!important; } .inv-col-buyer{ display:none!important; } }
        @media(max-width:520px) { .inv-row-card{ grid-template-columns:1fr!important; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:22, left:"50%", zIndex:9999,
          transform:"translateX(-50%)", animation:"islidedown .32s ease both",
          display:"flex", alignItems:"center", gap:10,
          background: toast.ok ? "var(--inv-toast-ok)" : "var(--inv-toast-err)",
          border:"1px solid " + (toast.ok ? "rgba(52,211,153,.4)" : "rgba(248,113,113,.4)"),
          borderRadius:14, padding:"12px 22px",
          color: toast.ok ? C.green : C.red,
          fontSize:13, fontWeight:600, boxShadow:"0 12px 40px rgba(0,0,0,.2)",
        }}>
          <span style={{fontSize:15}}>{toast.ok ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1260, margin:"0 auto" }}>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:16, marginBottom:28, animation:"ifadeup .4s ease both",
        }}>
          <div>
            <h1 style={{
              margin:0, fontFamily:"'DM Serif Display',serif",
              fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:400, color:C.text1,
            }}>
              My Invoices
            </h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:C.text3 }}>
              {loading ? "Loading…" : hasFilter
                ? invoices.length + " invoice" + (invoices.length!==1?"s":"") + " matching filters"
                : totalCount + " invoice" + (totalCount!==1?"s":"") + " total"}
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

        {/* ── Filter row: Search | Buyer | Date | Month ── */}
        <div className="inv-filter-row" style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-end" }}>

          {/* Search */}
          <div style={{ position:"relative", flex:"1 1 0", minWidth:0 }}>
            <svg style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search invoice # or buyer…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="inv-filter-input inv-search-input"
            />
            {searchInput && (
              <button onClick={()=>setSearchInput("")} style={{
                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:C.text4, fontSize:18, padding:4, lineHeight:1,
              }}>×</button>
            )}
          </div>

          <div className="inv-filter-divider"/>

          {/* Buyer filter — select dropdown */}
          <div style={{ position:"relative", flexShrink:0 }}>
            {/* Person icon */}
            <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {/* Chevron icon */}
            <svg style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <select
              value={buyerFilter}
              onChange={e => { setBuyerFilter(e.target.value); setPage(1); }}
              className="inv-filter-input inv-buyer-select"
            >
              <option value="">All Buyers</option>
              {allBuyers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="inv-filter-divider"/>

          {/* Date filter — single date input */}
          <div className="inv-date-wrap">
            <span className="inv-date-label">📅 Filter by Date</span>
            <div style={{ position:"relative" }}>
              <input
                type="date"
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                className="inv-sel"
                style={{ width:160, padding:"0 10px", cursor:"pointer" }}
                title="Filter by exact date"
              />
              {dateFilter && (
                <button onClick={()=>{ setDateFilter(""); setPage(1); }} style={{
                  position:"absolute", right:30, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:C.text4, fontSize:16, padding:2, lineHeight:1, zIndex:2,
                }}>×</button>
              )}
            </div>
          </div>

          <div className="inv-filter-divider"/>

          {/* Month filter — Month + Year selects */}
          <div className="inv-date-wrap">
            <span className="inv-date-label">🗓 Filter by Month</span>
            <div className="inv-date-row">
              {/* Month */}
              <div style={{ position:"relative" }}>
                <select
                  value={selMonth}
                  onChange={e => { setSelMonth(e.target.value); }}
                  className="inv-sel inv-sel-month"
                >
                  <option value="">Month</option>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                    <option key={m} value={String(i+1).padStart(2,"0")}>{m}</option>
                  ))}
                </select>
                <svg style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Year */}
              <div style={{ position:"relative" }}>
                <select
                  value={selYear}
                  onChange={e => { setSelYear(e.target.value); }}
                  className="inv-sel inv-sel-year"
                >
                  <option value="">Year</option>
                  {Array.from({length:6},(_,i)=> String(new Date().getFullYear() - i)).map(y=>(
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <svg style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {(selMonth || selYear) && (
                <button onClick={()=>{ setSelMonth(""); setSelYear(""); setMonthFilter(""); setPage(1); }} title="Clear month" style={{
                  background:"rgba(248,113,113,.10)", border:"1px solid rgba(248,113,113,.25)",
                  borderRadius:8, cursor:"pointer", color:C.red,
                  fontSize:16, padding:"0 10px", height:46, lineHeight:1,
                }}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Active filter pills ── */}
        {(buyerFilter || dateFilter || monthFilter) && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>

            {buyerFilter && (
              <div className="inv-pill" style={{
                background:"rgba(96,165,250,.08)", border:"1px solid rgba(96,165,250,.22)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>
                  Buyer: <span style={{ color:C.text1, fontWeight:500 }}>{buyerFilter}</span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={()=>{ setBuyerFilter(""); setPage(1); }}>×</button>
              </div>
            )}

            {dateFilter && (
              <div className="inv-pill" style={{
                background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.22)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>
                  Date: <span style={{ color:C.text1, fontWeight:500 }}>
                    {new Date(dateFilter + "T00:00:00").toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                  </span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={()=>{ setDateFilter(""); setPage(1); }}>×</button>
              </div>
            )}

            {monthFilter && (
              <div className="inv-pill" style={{
                background:"rgba(167,139,250,.08)", border:"1px solid rgba(167,139,250,.22)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize:12, color:C.purple, fontWeight:600 }}>
                  Month: <span style={{ color:C.text1, fontWeight:500 }}>
                    {new Date(monthFilter + "-01T00:00:00").toLocaleDateString("en-IN", { month:"long", year:"numeric" })}
                  </span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={()=>{ setMonthFilter(""); setPage(1); }}>×</button>
              </div>
            )}

            <button onClick={clearFilters} style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"5px 12px", borderRadius:8, cursor:"pointer",
              background:"transparent", border:"1px solid var(--inv-border)",
              color:C.text3, fontSize:12, fontWeight:600, fontFamily:"inherit",
            }}>
              Clear all
            </button>
          </div>
        )}

        {/* Column headers */}
        {!loading && invoices.length > 0 && (
          <div style={{
            display:"grid", gridTemplateColumns:"38px 1fr 1fr 1fr auto",
            gap:14, padding:"0 20px", marginBottom:8,
          }}>
            {["#", "Invoice / Buyer", "Buyer (click to filter)", "Total", "Actions"].map((h,i)=>(
              <span key={i} style={{
                fontSize:10, fontWeight:800, color:C.text4,
                textTransform:"uppercase", letterSpacing:".1em",
                textAlign: i===0?"center":i===4?"right":"left",
              }}>{h}</span>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{
              width:44, height:44, borderRadius:"50%", margin:"0 auto 16px",
              border:"3px solid rgba(232,201,122,.15)", borderTopColor:C.gold,
              animation:"ispin .7s linear infinite",
            }}/>
            <p style={{ color:C.text3, fontSize:13 }}>Loading invoices…</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState hasFilter={hasFilter} onClear={clearFilters}/>
        ) : (
          <>
            {hasPinned && (
              <div style={{ marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:".1em" }}>📌 Pinned</span>
                  <div style={{ flex:1, height:1, background:"rgba(232,201,122,.2)" }}/>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {invoices.filter(inv => inv.isPinned).map((inv) => (
                    <InvoiceRow key={inv._id} invoice={inv}
                      serial={invoices.indexOf(inv) + 1 + (page-1)*10}
                      onDelete={handleDelete} onDuplicate={handleDuplicate}
                      onPin={handlePin} onDownload={handleDownload}
                      onBuyerClick={handleBuyerClick}
                      deleting={deleting===inv._id} duplicating={duplicating===inv._id}
                      pinning={pinning===inv._id} downloading={downloading===inv._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasUnpinned && (
              <div>
                {hasPinned && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, margin:"12px 0 8px" }}>
                    <span style={{ fontSize:10, fontWeight:800, color:C.text4, textTransform:"uppercase", letterSpacing:".1em" }}>All invoices</span>
                    <div style={{ flex:1, height:1, background:C.border }}/>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:32 }}>
                  {invoices.filter(inv => !inv.isPinned).map((inv) => (
                    <InvoiceRow key={inv._id} invoice={inv}
                      serial={invoices.indexOf(inv) + 1 + (page-1)*10}
                      onDelete={handleDelete} onDuplicate={handleDuplicate}
                      onPin={handlePin} onDownload={handleDownload}
                      onBuyerClick={handleBuyerClick}
                      deleting={deleting===inv._id} duplicating={duplicating===inv._id}
                      pinning={pinning===inv._id} downloading={downloading===inv._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid " + C.border, background:"transparent",
                    color:page===1?C.text4:C.text2, fontSize:13, fontFamily:"inherit",
                    opacity:page===1?0.5:1 }}>← Prev</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer",
                      border:"1px solid " + (p===page?C.goldBdr:C.border),
                      background:p===page?C.goldBg:"transparent",
                      color:p===page?C.gold:C.text2,
                      fontSize:13, fontWeight:p===page?700:400, fontFamily:"inherit" }}>{p}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid " + C.border, background:"transparent",
                    color:page===totalPages?C.text4:C.text2, fontSize:13, fontFamily:"inherit",
                    opacity:page===totalPages?0.5:1 }}>Next →</button>
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