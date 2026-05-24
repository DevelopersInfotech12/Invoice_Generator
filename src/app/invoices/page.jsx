"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../auth/components/AuthGuard";
import { invoiceApi } from "../auth/api/authApi";
import Link from "next/link";
import { EmptyState, InvoiceRow } from "../components/InvoiceRow";

const C = {
  bg:     "var(--inv-bg)",
  surface:"var(--inv-surface)",
  border: "var(--inv-border)",
  gold:   "#E8C97A",
  goldBg: "rgba(232,201,122,0.10)",
  goldBdr:"rgba(232,201,122,0.30)",
  text1:  "var(--inv-text1)",
  text2:  "var(--inv-text2)",
  text3:  "var(--inv-text3)",
  text4:  "var(--inv-text4)",
  red:    "#F87171",
  green:  "#34D399",
  blue:   "#60A5FA",
  purple: "#A78BFA",
};

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
  const [dateFilter,  setDateFilter]  = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selMonth,    setSelMonth]    = useState(String(new Date().getMonth()+1).padStart(2,"0"));
  const [selYear,     setSelYear]     = useState(String(new Date().getFullYear()));
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [toast,       setToast]       = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [allBuyers,   setAllBuyers]   = useState([]);

  const showToast = (msg, ok=true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.getAll({ page, limit:10, search });
      let list = data.invoices || [];
      if (buyerFilter) list = list.filter(inv => (inv.to?.name || "").toLowerCase().includes(buyerFilter.toLowerCase()));
      if (dateFilter)  list = list.filter(inv => (inv.date || "").startsWith(dateFilter));
      if (monthFilter) list = list.filter(inv => (inv.date || "").startsWith(monthFilter));
      setInvoices(list);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      setAllBuyers([...new Set((data.invoices || []).map(inv => inv.to?.name).filter(Boolean))].sort());
    } catch (err) { showToast(err.message, false); }
    finally { setLoading(false); }
  }, [page, search, buyerFilter, dateFilter, monthFilter]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (selYear && selMonth) { setMonthFilter(selYear + "-" + selMonth); setPage(1); }
    else setMonthFilter("");
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
        const updated = prev.map(inv => inv._id === id ? {...inv, isPinned:data.isPinned} : inv);
        return [...updated].sort((a,b) => (b.isPinned?1:0) - (a.isPinned?1:0));
      });
    } catch (err) { showToast(err.message || "Failed to pin.", false); }
    finally { setPinning(null); }
  };

  const handleDownload = (id) => {
    setDownloading(id);
    window.open("/invoices/"+id+"?print=1", "_blank");
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
      setTimeout(() => router.push("/invoices/"+data.invoice._id), 700);
    } catch (err) { showToast(err.message || "Failed to duplicate.", false); }
    finally { setDuplicating(null); }
  };

  const handleBuyerClick = (name) => {
    setBuyerFilter(name); setPage(1);
    showToast("Filtered by buyer: " + name);
  };

  const clearFilters = () => {
    setBuyerFilter(""); setDateFilter("");
    setSelMonth(String(new Date().getMonth()+1).padStart(2,"0"));
    setSelYear(String(new Date().getFullYear()));
    setSearchInput(""); setSearch(""); setPage(1);
  };

  const hasFilter   = !!(search || buyerFilter || dateFilter || monthFilter);
  const hasPinned   = invoices.some(inv => inv.isPinned);
  const hasUnpinned = invoices.some(inv => !inv.isPinned);

  const rowProps = (inv) => ({
    key: inv._id,
    invoice: inv,
    serial: invoices.indexOf(inv) + 1 + (page-1)*10,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onPin: handlePin,
    onDownload: handleDownload,
    onBuyerClick: handleBuyerClick,
    deleting:    deleting    === inv._id,
    duplicating: duplicating === inv._id,
    pinning:     pinning     === inv._id,
    downloading: downloading === inv._id,
  });

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      backgroundImage:"radial-gradient(ellipse 70% 45% at 15% -5%,var(--inv-grad1) 0%,transparent 60%),radial-gradient(ellipse 55% 40% at 85% 105%,var(--inv-grad2) 0%,transparent 55%)",
      padding:"40px 20px 80px", fontFamily:"'DM Sans',sans-serif", color:C.text1,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        @keyframes ifadeup    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes islidedown { from{opacity:0;transform:translateY(-14px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes ispin      { to{transform:rotate(360deg)} }

        /* ── Table core ── */
        .inv-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid var(--inv-border);
          border-radius: 14px;
          overflow: hidden;
          animation: ifadeup .32s ease both;
        }
        .inv-thead-tr th {
          padding: 11px 14px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--inv-text4);
          background: var(--inv-surface);
          border-bottom: 1px solid var(--inv-border);
          white-space: nowrap;
          user-select: none;
        }
        .inv-thead-tr th:first-child { border-radius: 13px 0 0 0; }
        .inv-thead-tr th:last-child  { border-radius: 0 13px 0 0; }

        /* ── Row ── */
        .inv-tr td { border-bottom: 1px solid var(--inv-border); }
        .inv-tr:last-child td { border-bottom: none; }
        .inv-tr:last-child td:first-child { border-radius: 0 0 0 13px; }
        .inv-tr:last-child td:last-child  { border-radius: 0 0 13px 0; }
        .inv-tr { background: var(--inv-surface); transition: background .15s; }
        .inv-tr:hover { background: var(--inv-surface-hover, rgba(232,201,122,0.03)) !important; }
        .inv-tr-pinned { background: rgba(232,201,122,0.04) !important; }
        .inv-tr-pinned td { border-bottom-color: rgba(232,201,122,0.15) !important; }
        .inv-tr-section td {
          padding: 7px 14px 5px;
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .1em;
          color: var(--inv-text4);
          background: var(--inv-bg) !important;
          border-bottom: 1px solid var(--inv-border);
        }
        .inv-tr-section-pin td { color: #E8C97A !important; background: rgba(232,201,122,0.04) !important; }

        .inv-td { padding: 15px 14px; vertical-align: middle; }
        .inv-td-serial { width: 44px; text-align: center; }
        .inv-td-actions { width: 1px; white-space: nowrap; }

        /* Total col never wraps */
        .inv-col-total { white-space: nowrap; }

        /* action button hovers */
        .inv-btn-edit:hover  { background: rgba(232,201,122,.22) !important; }
        .inv-btn-dup:hover   { background: rgba(96,165,250,.22) !important; }
        .inv-btn-del:hover   { background: rgba(248,113,113,.2) !important; color: #F87171 !important; border-color: rgba(248,113,113,.45) !important; }

        /* ── Filters ── */
        .inv-filter-input {
          background: var(--inv-surface) !important;
          color: var(--inv-text1) !important;
          border: 1.5px solid var(--inv-border) !important;
          border-radius: 12px; font-size: 13px; font-family: inherit;
          transition: border-color .2s, box-shadow .2s;
          outline: none; height: 44px; box-sizing: border-box;
        }
        .inv-filter-input:focus { border-color: #E8C97A !important; box-shadow: 0 0 0 3px rgba(232,201,122,.12) !important; }
        .inv-filter-input::placeholder { color: var(--inv-text4) !important; }
        .inv-filter-input option { background: var(--inv-surface); color: var(--inv-text1); }
        .inv-search-input { width: 100%; padding: 0 36px 0 38px; }
        .inv-buyer-select { min-width:150px; max-width:240px; padding:0 28px 0 34px; cursor:pointer; appearance:none; -webkit-appearance:none; }
        .inv-date-wrap  { flex-shrink:0; display:flex; flex-direction:column; gap:3px; }
        .inv-date-label { font-size:9px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--inv-text4); padding-left:4px; }
        .inv-date-row   { display:flex; gap:4px; }
        .inv-sel        { height:44px; padding:0 26px 0 11px; cursor:pointer; appearance:none; -webkit-appearance:none;
                          background:var(--inv-surface)!important; color:var(--inv-text1)!important;
                          border:1.5px solid var(--inv-border)!important; border-radius:10px;
                          font-size:13px; font-family:inherit; outline:none;
                          transition:border-color .2s, box-shadow .2s; box-sizing:border-box; }
        .inv-sel:focus  { border-color:#E8C97A!important; box-shadow:0 0 0 3px rgba(232,201,122,.12)!important; }
        .inv-sel option { background:var(--inv-surface); color:var(--inv-text1); }
        .inv-sel-month  { width:115px; }
        .inv-sel-year   { width:84px; }
        .inv-filter-divider { width:1px; height:24px; flex-shrink:0; background:var(--inv-border); opacity:0.5; margin-bottom:10px; }
        .inv-pill { display:inline-flex; align-items:center; gap:7px; padding:5px 11px; border-radius:8px; font-size:12px; font-weight:600; }
        .inv-pill-close { background:none; border:none; cursor:pointer; font-size:15px; padding:0 2px; line-height:1; margin-left:2px; opacity:0.6; }
        .inv-pill-close:hover { opacity:1; }
        .inv-filter-row { flex-wrap:wrap; }

        /* ── Table scroll wrapper ── */
        .inv-table-scroll {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
        }
        .inv-table-scroll .inv-table {
          min-width: 560px;
        }

        /* ── Breakpoints ── */
        @media(max-width:900px) {
          .inv-filter-row { flex-direction:column!important; align-items:stretch!important; }
          .inv-buyer-select { width:100%!important; max-width:100%!important; }
          .inv-date-wrap { width:100%; }
          .inv-filter-divider { display:none!important; }
        }
        @media(max-width:1000px) { .inv-col-date  { display:none!important; } .inv-th-date  { display:none!important; } }
        @media(max-width:760px)  { .inv-col-buyer { display:none!important; } .inv-th-buyer { display:none!important; } }
        @media(max-width:560px)  { .inv-td-actions .inv-btn-dup { display:none!important; } }

        /* ── MOBILE ACTION BUTTONS ──
           Hide text labels, keep icons. Buttons become square icon pads.        */
        @media(max-width:640px) {
          /* Page header stacks */
          .inv-page-hdr {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          /* Filter row stacks */
          .inv-filter-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .inv-filter-divider { display: none !important; }
          .inv-search-wrap { width: 100% !important; }
          .inv-buyer-select { width:100%!important; max-width:100%!important; min-width:unset!important; }
          .inv-date-wrap { width: 100%; }
          .inv-sel-month { width: 100% !important; flex: 1; }

          /* Tighter cells */
          .inv-td { padding: 10px 6px !important; }
          .inv-thead-tr th { padding: 8px 6px !important; font-size: 9px !important; }

          /* Pagination wraps */
          .inv-pagination { flex-wrap: wrap !important; justify-content: center !important; }

          /* ↓ KEY FIX: hide text labels inside PDF / Edit / Dup buttons */
          .inv-btn-label { display: none !important; }

          /* Tighter action button padding (icon-only = square feel) */
          .inv-btn-pdf,
          .inv-btn-edit,
          .inv-btn-dup { padding: 5px 6px !important; gap: 0 !important; }
        }

        /* ── Very small: also hide pin button, hide serial + type cols ── */
        @media(max-width:480px) {
          .inv-td-serial { display: none !important; }
          .inv-th-serial { display: none !important; }
          .inv-col-type  { display: none !important; }
          .inv-th-type   { display: none !important; }

          /* Hide pin on tiny screens — more room for PDF/Edit/Delete */
          .inv-btn-pin { display: none !important; }

          /* Smaller total font */
          .inv-col-total span { font-size: 12px !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:22, left:"50%", zIndex:9999,
          transform:"translateX(-50%)", animation:"islidedown .32s ease both",
          display:"flex", alignItems:"center", gap:10,
          background: toast.ok ? "var(--inv-toast-ok)" : "var(--inv-toast-err)",
          border:"1px solid " + (toast.ok ? "rgba(52,211,153,.4)" : "rgba(248,113,113,.4)"),
          borderRadius:14, padding:"11px 20px",
          color: toast.ok ? C.green : C.red,
          fontSize:13, fontWeight:600, boxShadow:"0 12px 40px rgba(0,0,0,.2)",
        }}>
          <span style={{fontSize:15}}>{toast.ok ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1300, margin:"0 auto" }}>

        {/* Header */}
        <div className="inv-page-hdr" style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:16, marginBottom:24, animation:"ifadeup .4s ease both",
        }}>
          <div>
            <h1 style={{ margin:0, fontFamily:"'DM Serif Display',serif",
              fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:400, color:C.text1 }}>
              My Invoices
            </h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:C.text3 }}>
              {loading ? "Loading…" : hasFilter
                ? invoices.length + " invoice" + (invoices.length !== 1 ? "s" : "") + " matching filters"
                : totalCount + " invoice" + (totalCount !== 1 ? "s" : "") + " total"}
            </p>
          </div>
          <Link href="/" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"11px 22px", borderRadius:12, textDecoration:"none",
            background:"linear-gradient(135deg,#E8C97A,#B8913A)",
            color:"#1A1008", fontSize:13, fontWeight:800,
            boxShadow:"0 4px 18px rgba(232,201,122,.28)",
            flexShrink:0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Invoice
          </Link>
        </div>

        {/* Filter row */}
        <div className="inv-filter-row" style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-end" }}>
          {/* Search */}
          <div className="inv-search-wrap" style={{ position:"relative", flex:"1 1 0", minWidth:0 }}>
            <svg style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search invoice # or buyer…" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="inv-filter-input inv-search-input"/>
            {searchInput && (
              <button onClick={() => setSearchInput("")} style={{
                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:C.text4, fontSize:18, padding:4, lineHeight:1,
              }}>×</button>
            )}
          </div>

          <div className="inv-filter-divider"/>

          {/* Buyer filter */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <svg style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <svg style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <select value={buyerFilter} onChange={e => { setBuyerFilter(e.target.value); setPage(1); }}
              className="inv-filter-input inv-buyer-select">
              <option value="">All Buyers</option>
              {allBuyers.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="inv-filter-divider"/>

          {/* Date filter */}
          <div className="inv-date-wrap">
            <span className="inv-date-label">📅 Date</span>
            <div style={{ position:"relative" }}>
              <input type="date" value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                className="inv-sel" style={{ width:155, padding:"0 10px", cursor:"pointer" }}/>
              {dateFilter && (
                <button onClick={() => { setDateFilter(""); setPage(1); }} style={{
                  position:"absolute", right:28, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:C.text4, fontSize:16, padding:2, lineHeight:1, zIndex:2,
                }}>×</button>
              )}
            </div>
          </div>

          <div className="inv-filter-divider"/>

          {/* Month filter */}
          <div className="inv-date-wrap">
            <span className="inv-date-label">🗓 Month</span>
            <div className="inv-date-row">
              <div style={{ position:"relative" }}>
                <select value={selMonth} onChange={e => setSelMonth(e.target.value)} className="inv-sel inv-sel-month">
                  <option value="">Month</option>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
                    <option key={m} value={String(i+1).padStart(2,"0")}>{m}</option>
                  ))}
                </select>
                <svg style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div style={{ position:"relative" }}>
                <select value={selYear} onChange={e => setSelYear(e.target.value)} className="inv-sel inv-sel-year">
                  <option value="">Year</option>
                  {Array.from({length:6}, (_,i) => String(new Date().getFullYear() - i)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <svg style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--inv-text4)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {(selMonth || selYear) && (
                <button onClick={() => { setSelMonth(""); setSelYear(""); setMonthFilter(""); setPage(1); }}
                  style={{ background:"rgba(248,113,113,.10)", border:"1px solid rgba(248,113,113,.25)",
                    borderRadius:8, cursor:"pointer", color:C.red,
                    fontSize:16, padding:"0 10px", height:44, lineHeight:1 }}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {(buyerFilter || dateFilter || monthFilter) && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
            {buyerFilter && (
              <div className="inv-pill" style={{ background:"rgba(96,165,250,.08)", border:"1px solid rgba(96,165,250,.22)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>
                  Buyer: <span style={{ color:C.text1, fontWeight:500 }}>{buyerFilter}</span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={() => { setBuyerFilter(""); setPage(1); }}>×</button>
              </div>
            )}
            {dateFilter && (
              <div className="inv-pill" style={{ background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.22)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>
                  Date: <span style={{ color:C.text1, fontWeight:500 }}>
                    {new Date(dateFilter+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                  </span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={() => { setDateFilter(""); setPage(1); }}>×</button>
              </div>
            )}
            {monthFilter && (
              <div className="inv-pill" style={{ background:"rgba(167,139,250,.08)", border:"1px solid rgba(167,139,250,.22)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize:12, color:C.purple, fontWeight:600 }}>
                  Month: <span style={{ color:C.text1, fontWeight:500 }}>
                    {new Date(monthFilter+"-01T00:00:00").toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
                  </span>
                </span>
                <button className="inv-pill-close" style={{ color:C.text4 }}
                  onClick={() => { setMonthFilter(""); setPage(1); }}>×</button>
              </div>
            )}
            <button onClick={clearFilters} style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"5px 12px", borderRadius:8, cursor:"pointer",
              background:"transparent", border:"1px solid var(--inv-border)",
              color:C.text3, fontSize:12, fontWeight:600, fontFamily:"inherit",
            }}>Clear all</button>
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
        ) : (
          <>
            <div className="inv-table-scroll">
              <table className="inv-table">
                <thead>
                  <tr className="inv-thead-tr">
                    <th className="inv-th-serial" style={{ textAlign:"center", width:44 }}>#</th>
                    <th className="inv-th-type" style={{ textAlign:"center" }}>Type</th>
                    <th style={{ textAlign:"center" }}>Invoice #</th>
                    <th className="inv-th-date" style={{ textAlign:"center" }}>Date</th>
                    <th className="inv-th-buyer" style={{ textAlign:"center" }}>Buyer</th>
                    <th style={{ textAlign:"center" }}>Total</th>
                    <th style={{ textAlign:"center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <EmptyState hasFilter={hasFilter} onClear={clearFilters}/>
                  ) : (
                    <>
                      {hasPinned && (
                        <>
                          <tr className="inv-tr-section inv-tr-section-pin">
                            <td colSpan={7}>📌 Pinned</td>
                          </tr>
                          {invoices.filter(inv => inv.isPinned).map(inv => (
                            <InvoiceRow {...rowProps(inv)}/>
                          ))}
                        </>
                      )}
                      {hasUnpinned && (
                        <>
                          {hasPinned && (
                            <tr className="inv-tr-section">
                              <td colSpan={7}>All invoices</td>
                            </tr>
                          )}
                          {invoices.filter(inv => !inv.isPinned).map(inv => (
                            <InvoiceRow {...rowProps(inv)}/>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="inv-pagination" style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid "+C.border, background:"transparent",
                    color:page===1?C.text4:C.text2, fontSize:13, fontFamily:"inherit",
                    opacity:page===1?0.5:1 }}>← Prev</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer",
                      border:"1px solid "+(p===page?C.goldBdr:C.border),
                      background:p===page?C.goldBg:"transparent",
                      color:p===page?C.gold:C.text2,
                      fontSize:13, fontWeight:p===page?700:400, fontFamily:"inherit" }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:"8px 16px", borderRadius:10, cursor:"pointer",
                    border:"1px solid "+C.border, background:"transparent",
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
      <InvoicesContent/>
    </AuthGuard>
  );
}