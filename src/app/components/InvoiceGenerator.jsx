"use client";
import React, { useState, useRef, useEffect } from "react";
import InvoicePrint from "./InvoicePrint";
import { invoiceApi } from "../auth/api/authApi";
import { useAuth } from "../auth/hooks/useAuth";

const API_KEY = "0563aa1121mshac8e837fdc8b3c9p1838c5jsnd2139ed3c4e2";
const API_HOST = "gst-insights-api.p.rapidapi.com";

const defaultInvoice = {
  invoiceNumber: "", date: new Date().toISOString().split("T")[0], suppliersRef: "",
  buyerOrderNo: "", dispatchDocNo: "", dispatchedThrough: "", termsOfDelivery: "",
  from: { name: "", address: "", city: "", state: "", zipCode: "", stateCode: "", gstin: "", pan: "" },
  to: { name: "", address: "", city: "", state: "", zipCode: "", gstin: "" },
  items: [{ description: "", hsn: "", quantity: 1, rate: 0, per: "Nos", amount: 0 }],
  tax: 18, taxType: "cgst_sgst",
  notes: "We declare that this Invoice shows the actual price of the goods described and that all particulars are true and correct.",
  bank: { bankName: "", accountHolder: "", accountNumber: "", confirmAccountNumber: "", ifsc: "", accountType: "Current", branch: "" },
};

/* ─── Design tokens ─── */
const T = {
  bg: "var(--inv-bg)",
  surface: "var(--inv-surface)",
  border: "var(--inv-border)",
  text1: "var(--inv-text1)",
  text2: "var(--inv-text2)",
  text3: "var(--inv-text3)",
  text4: "var(--inv-text4)",
  accent: "#2563EB",
  accentLt: "rgba(37,99,235,0.08)",
  accentBd: "rgba(37,99,235,0.25)",
  danger: "#DC2626",
  success: "#16A34A",
  successLt: "rgba(22,163,74,0.08)",
  successBd: "rgba(22,163,74,0.30)",
};

/* ─── Input ─── */
function Input({ label, value, onChange, type = "text", mono = false, maxLength, readOnly = false, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 600, color: T.text3,
          textTransform: "uppercase", letterSpacing: ".06em",
        }}>{label}</label>
      )}
      <input
        type={type} value={value} onChange={onChange}
        maxLength={maxLength} readOnly={readOnly}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: readOnly ? "var(--inv-surface-hover)" : T.surface,
          border: `1px solid ${focused ? T.accent : T.border}`,
          borderRadius: 6, padding: "9px 11px",
          fontSize: 13.5, color: T.text1,
          fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : "inherit",
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: focused ? `0 0 0 3px ${T.accentLt}` : "none",
          letterSpacing: mono ? ".04em" : "normal",
        }}
      />
    </div>
  );
}

/* ─── Textarea ─── */
function Textarea({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 600, color: T.text3,
          textTransform: "uppercase", letterSpacing: ".06em"
        }}>{label}</label>
      )}
      <textarea value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box", minHeight: 110, resize: "vertical",
          background: T.surface, border: `1px solid ${focused ? T.accent : T.border}`,
          borderRadius: 6, padding: "9px 11px",
          fontSize: 13, color: T.text1, lineHeight: 1.65,
          fontFamily: "inherit", outline: "none",
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: focused ? `0 0 0 3px ${T.accentLt}` : "none",
        }} />
    </div>
  );
}

/* ─── Select ─── */
function Select({ label, value, onChange, children, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 600, color: T.text3,
          textTransform: "uppercase", letterSpacing: ".06em"
        }}>{label}</label>
      )}
      <select value={value} onChange={onChange} style={{
        width: "100%", boxSizing: "border-box",
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 6, padding: "9px 11px",
        fontSize: 13.5, color: T.text1,
        cursor: "pointer", outline: "none",
        appearance: "auto",
        transition: "border-color .15s",
      }}>{children}</select>
    </div>
  );
}

/* ─── Animated number ─── */
function AnimNum({ value, prefix = "₹", dec = 2 }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const s = prev.current, e = value, dur = 320, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1), ep = p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setDisp(s + (e - s) * ep);
      if (p < 1) requestAnimationFrame(tick); else { setDisp(e); prev.current = e; }
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{disp.toFixed(dec)}</span>;
}

/* ─── Spinner ─── */
function Spinner({ color = "#fff" }) {
  return <span style={{
    display: "inline-block", width: 13, height: 13,
    border: `2px solid ${color}33`, borderTopColor: color,
    borderRadius: "50%", animation: "inv-spin .7s linear infinite"
  }} />;
}

/* ─── Section label ─── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: T.text3,
      textTransform: "uppercase", letterSpacing: ".1em",
      paddingBottom: 12, marginBottom: 16,
      borderBottom: `1px solid ${T.border}`,
    }}>{children}</div>
  );
}

/* ─── Card ─── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: "20px 22px",
      ...style,
    }}>{children}</div>
  );
}

/* ─── Badge ─── */
function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 4,
      fontSize: 11, fontWeight: 700,
      background: `${color}14`,
      color: color,
      border: `1px solid ${color}30`,
      letterSpacing: ".05em", textTransform: "uppercase",
    }}>{children}</span>
  );
}

/* ─── Toast ─── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", zIndex: 9999,
      transform: "translateX(-50%)",
      animation: "inv-slidedown .25s ease both",
      display: "flex", alignItems: "center", gap: 10,
      background: toast.ok ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${toast.ok ? "#bbf7d0" : "#fecaca"}`,
      borderRadius: 6, padding: "10px 18px",
      color: toast.ok ? "#15803d" : "#b91c1c",
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
    }}>
      <span>{toast.ok ? "✓" : "✕"}</span>
      {toast.msg}
    </div>
  );
}

/* ─── GST Fetch Button ─── */
function FetchGSTBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "9px 14px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
      background: T.accent, border: "none", color: "#fff",
      fontSize: 12, fontWeight: 600,
      opacity: loading ? 0.7 : 1,
      whiteSpace: "nowrap",
      transition: "opacity .15s, transform .15s",
      flexShrink: 0,
    }}>
      {loading ? <><Spinner />Fetching…</> : <>⚡ Fetch GST</>}
    </button>
  );
}

/* ─── Party Section ─── */
function PartySection({ title, gstin, onGstinChange, onFetch, loading, error, fields, values, onChange }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        <label style={{
          fontSize: 11, fontWeight: 600, color: T.text3,
          textTransform: "uppercase", letterSpacing: ".06em",
          display: "block", marginBottom: 5
        }}>GSTIN / UIN</label>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <input
            value={gstin} onChange={onGstinChange} maxLength={15}
            placeholder="Enter 15-digit GSTIN"
            style={{
              flex: 1, boxSizing: "border-box",
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 6, padding: "9px 11px",
              fontSize: 13, color: T.text1,
              fontFamily: "'JetBrains Mono','Courier New',monospace",
              letterSpacing: ".05em", outline: "none",
            }}
          />
          <FetchGSTBtn onClick={onFetch} loading={loading} />
        </div>
        {error && <p style={{ margin: "5px 0 0", fontSize: 12, color: T.danger, fontWeight: 500 }}>{error}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {fields.map(({ label, key, mono, fullWidth }) => (
          <div key={key} style={fullWidth ? { gridColumn: "1/-1" } : {}}>
            <Input label={label} value={values[key] || ""} mono={mono}
              onChange={e => onChange(key, key === "pan" ? e.target.value.toUpperCase() : e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ScrollShadow — gradient fade on left/right edges of overflowing
   table. Shows a scroll hint below that disappears once user scrolls.
══════════════════════════════════════════════════════════════════ */
function ScrollShadow({ children }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    if (el.scrollLeft > 4) setHasScrolled(true);
  };

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, []);

  const fade = (dir) => ({
    position: "absolute",
    [dir === "left" ? "left" : "right"]: 0,
    top: 0, bottom: 0, width: 56,
    pointerEvents: "none", zIndex: 3,
    borderRadius: dir === "left" ? "8px 0 0 8px" : "0 8px 8px 0",
    background: `linear-gradient(to ${dir === "left" ? "right" : "left"}, var(--inv-surface, #fff) 0%, transparent 100%)`,
    opacity: dir === "left" ? (showLeft ? 1 : 0) : (showRight ? 1 : 0),
    transition: "opacity .2s ease",
  });

  return (
    <div style={{ position: "relative" }}>
      <div style={fade("left")} />
      <div
        ref={scrollRef}
        className="inv-scroll-area-custom"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 transparent",
        }}
      >
        <div style={{ minWidth: 820 }}>{children}</div>
      </div>
      <div style={fade("right")} />

      {/* ── Scroll hint disclaimer — disappears once user scrolls ── */}
      {!hasScrolled && showRight && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 7,
          pointerEvents: "none",
        }}>
          <span style={{
            fontSize: 11,
            color: "var(--inv-text4)",
            fontStyle: "italic",
            letterSpacing: ".01em",
          }}>
            ← Scroll to see more columns
          </span>
          <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 3, height: 3, borderRadius: "50%",
                background: "var(--inv-text4)",
                animation: `inv-dot-bounce .9s ease ${i * 0.18}s infinite`,
              }} />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */
export default function InvoiceGenerator({ initialData = null }) {
  const [inv, setInv] = useState(initialData || defaultInvoice);
  const [editingId, setEditingId] = useState(initialData?._id || null);
  const [isProforma, setIsProforma] = useState(initialData?.isProforma || false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [gstLoading, setGstLoading] = useState({ from: false, to: false });
  const [gstError, setGstError] = useState({ from: "", to: "" });
  const [loginPrompt, setLoginPrompt] = useState(false);

  const { user } = useAuth();

  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
  const isIGST = inv.taxType === "igst";
  const igstAmt = subtotal * inv.tax / 100;
  const cgst = subtotal * inv.tax / 200;
  const sgst = subtotal * inv.tax / 200;
  const taxAmt = isIGST ? igstAmt : cgst + sgst;
  const total = subtotal + taxAmt;

  const set = p => setInv(s => ({ ...s, ...p }));
  const setBank = (f, v) => setInv(s => ({ ...s, bank: { ...s.bank, [f]: v } }));

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setTimeout(() => setIsPrinting(false), 500); }, 100);
  };

  const handleSave = async () => {
    if (!user) { setLoginPrompt(true); return; }
    setIsSaving(true);
    try {
      const payload = { ...inv, isProforma, subtotal, taxAmt, total };
      if (editingId) {
        await invoiceApi.update(editingId, payload);
        showToast("Invoice updated successfully.");
      } else {
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

  const handleNew = () => {
    setInv(defaultInvoice);
    setEditingId(null);
    setIsProforma(false);
    showToast("Started new invoice.");
  };

  const fetchGST = async party => {
    const gstin = inv[party].gstin.trim();
    if (!gstin || gstin.length < 15) { setGstError(e => ({ ...e, [party]: "Enter a valid 15-digit GSTIN" })); return; }
    setGstError(e => ({ ...e, [party]: "" }));
    setGstLoading(l => ({ ...l, [party]: true }));
    try {
      const res = await fetch(`https://${API_HOST}/getGSTDetailsUsingGST/${gstin}`,
        { headers: { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST } });
      const json = await res.json();
      if (!json.success || !json.data?.length) { setGstError(e => ({ ...e, [party]: "No GST details found." })); return; }
      const rec = json.data[0], name = rec.tradeName || rec.legalName || "";
      const pan = gstin.length === 15 ? gstin.slice(2, 12) : "";
      const addr = rec.principalAddress?.address || {};
      const line = [addr.buildingNumber, addr.buildingName, addr.floorNumber, addr.street, addr.location].filter(Boolean).join(", ");
      if (name) {
        setInv(s => ({
          ...s, [party]: {
            ...s[party], name,
            address: line || s[party].address,
            city: addr.district || addr.location || s[party].city,
            state: addr.stateCode || s[party].state,
            zipCode: addr.pincode || s[party].zipCode,
            ...(party === "from" ? { pan: pan || s.from.pan } : {}),
          }
        }));
        showToast(`${party === "from" ? "Seller" : "Buyer"}: ${name}`);
      } else setGstError(e => ({ ...e, [party]: "Could not extract business name." }));
    } catch (err) { setGstError(e => ({ ...e, [party]: "API error: " + (err.message || "Unknown") })); }
    finally { setGstLoading(l => ({ ...l, [party]: false })); }
  };

  const updateItem = (idx, field, value) => {
    set({
      items: inv.items.map((item, i) => {
        if (i !== idx) return item;
        const u = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") u.amount = (u.quantity || 0) * (u.rate || 0);
        return u;
      })
    });
  };

  const cellInput = (extra = {}) => ({
    width: "100%", boxSizing: "border-box",
    background: T.surface, border: "1px solid transparent",
    borderRadius: 4, padding: "10px 12px", minHeight: 40,
    fontSize: 13.5, color: T.text1, fontFamily: "inherit",
    outline: "none", transition: "border-color .15s, box-shadow .15s",
    ...extra,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        #inv-form, #inv-form * { font-family:'IBM Plex Sans',system-ui,sans-serif; box-sizing:border-box; }

.inv-scroll-area-custom::-webkit-scrollbar       { height: 5px; }
.inv-scroll-area-custom::-webkit-scrollbar-track { background: transparent; border-radius: 99px; }
.inv-scroll-area-custom::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 99px; }

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  .inv-scroll-area-custom::-webkit-scrollbar-thumb { background: #FFFFFF; }
}
[data-theme="dark"] .inv-scroll-area-custom::-webkit-scrollbar-thumb,
.dark .inv-scroll-area-custom::-webkit-scrollbar-thumb {
  background: #FFFFFF;
}

        @keyframes inv-spin      { to { transform:rotate(360deg); } }
        @keyframes inv-fadeup    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes inv-slidedown { from { opacity:0; transform:translateY(-8px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }
        @keyframes inv-dot-bounce {
          0%, 80%, 100% { transform:translateY(0); opacity:.4; }
          40%           { transform:translateY(-3px); opacity:1; }
        }

        .inv-cell-input:focus { border-color:${T.accent} !important; box-shadow:0 0 0 2px ${T.accentLt} !important; }
        .inv-row:hover       { background:var(--inv-surface-hover) !important; }
        .inv-btn-ghost:hover { border-color:${T.accent} !important; color:${T.accent} !important; }
        .inv-del:hover       { color:${T.danger} !important; background:rgba(220,38,38,0.08) !important; }
        .inv-add-row:hover   { background:${T.accentLt} !important; border-color:${T.accentBd} !important; color:${T.accent} !important; }

        .inv-item-cols {
          display:grid;
          grid-template-columns:minmax(180px,3fr) 110px 90px 130px 80px 130px 36px;
          gap:8px; align-items:center;
        }

        .inv-scroll-area::-webkit-scrollbar       { height:5px; }
        .inv-scroll-area::-webkit-scrollbar-track { background:transparent; }
        .inv-scroll-area::-webkit-scrollbar-thumb { background:var(--inv-border,#cbd5e1); border-radius:99px; }

        input[type=date]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:.5; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        select option { background:var(--inv-bg); color:var(--inv-text1); }
        ::placeholder  { color:var(--inv-text4) !important; opacity:1; }

        @media(max-width:900px) { .inv-2col { grid-template-columns:1fr !important; } }
        @media(max-width:660px) {
          .inv-hdr { flex-direction:column !important; }
          .inv-hdr-actions { width:100% !important; flex-wrap:wrap; }
          .inv-grid-3 { grid-template-columns:1fr 1fr !important; }
        }
        @media print {
          @page { size:A4; margin:0; }
          body       { margin:1cm !important; }
          #inv-form  { display:none !important; }
          #inv-print { display:block !important; }
        }

        nav a, nav button,
        header a, header button,
        [class*="navbar"] a, [class*="navbar"] button,
        [class*="nav-"] a,  [class*="nav-"] button {
          font-size:     14px !important;
          white-space:   nowrap !important;
          padding-left:  8px !important;
          padding-right: 8px !important;
        }
        [class*="brand"], [class*="logo"],
        nav h1, header h1 {
          font-size:   14px !important;
          white-space: nowrap !important;
        }
        nav, header,
        [class*="navbar"],
        [class*="nav-wrap"], [class*="nav-inner"] {
          gap: 4px !important;
        }
      `}</style>

      <Toast toast={toast} />

      {/* ── Login Modal ── */}
      {loginPrompt && (
        <div onClick={() => setLoginPrompt(false)} style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--inv-bg)", border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "32px 28px", maxWidth: 360, width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            animation: "inv-fadeup .25s ease both",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: T.text1 }}>Save Invoice</h3>
            <p style={{ margin: "0 0 22px", fontSize: 13, color: T.text3, lineHeight: 1.6 }}>
              Sign in or create a free account to save and manage your invoices.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/login" style={{
                display: "block", padding: "11px", background: T.accent,
                borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600,
                textAlign: "center", textDecoration: "none",
              }}>Sign In</a>
              <a href="/register" style={{
                display: "block", padding: "11px",
                background: "transparent", border: `1px solid ${T.border}`,
                borderRadius: 6, color: T.text2, fontSize: 13, fontWeight: 500,
                textAlign: "center", textDecoration: "none",
              }}>Create Free Account</a>
              <button onClick={() => setLoginPrompt(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: T.text4, fontFamily: "inherit", padding: "6px",
              }}>Continue without saving</button>
            </div>
          </div>
        </div>
      )}

      {/* Print view */}
      <div id="inv-print" style={{ display: "none" }}>
        <InvoicePrint invoice={inv} isProforma={isProforma}
          subtotal={subtotal} taxAmt={taxAmt} total={total} cgst={cgst} sgst={sgst} igstAmt={igstAmt} />
      </div>

      {/* ══════════ MAIN FORM ══════════ */}
      <div id="inv-form" style={{ minHeight: "100vh", background: "var(--inv-bg)", padding: "28px 20px 72px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <div className="inv-hdr" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 14, marginBottom: 28, animation: "inv-fadeup .35s ease both",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{
                  margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-.01em",
                  background: "linear-gradient(135deg,#E8C97A,#B8913A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {editingId ? "Edit Invoice" : "New Invoice"}
                </h1>
                <Badge color={isProforma ? "#D97706" : T.accent}>
                  {isProforma ? "Proforma" : "Tax Invoice"}
                </Badge>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: T.text3 }}>
                {editingId ? `Editing: ${inv.invoiceNumber || "Untitled"}` : "Create and manage GST invoices"}
              </p>
            </div>

            <div className="inv-hdr-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a href="/invoices" className="inv-btn-ghost" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 6,
                border: `1px solid ${T.border}`,
                background: "transparent", color: T.text2,
                fontSize: 13, fontWeight: 500, textDecoration: "none",
                transition: "all .15s", whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                My Invoices
              </a>

              {editingId && (
                <button onClick={handleNew} className="inv-btn-ghost" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 6,
                  border: `1px solid ${T.border}`,
                  background: "transparent", color: T.text2,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all .15s", whiteSpace: "nowrap",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New
                </button>
              )}

              <button
                onClick={() => { setIsProforma(p => !p); showToast(isProforma ? "Switched to Tax Invoice" : "Switched to Proforma"); }}
                className="inv-btn-ghost"
                style={{
                  padding: "8px 14px", borderRadius: 6,
                  border: `1px solid ${isProforma ? "#D97706" : T.border}`,
                  background: isProforma ? "rgba(217,119,6,0.08)" : "transparent",
                  color: isProforma ? "#D97706" : T.text2,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all .15s", whiteSpace: "nowrap",
                }}>
                ⇄ {isProforma ? "Switch to Tax" : "Proforma"}
              </button>

              <button onClick={handleSave} disabled={isSaving} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 6,
                background: T.successLt, border: `1px solid ${T.successBd}`,
                color: T.success, fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all .15s", whiteSpace: "nowrap",
              }}>
                {isSaving ? <><Spinner color={T.success} />Saving…</> : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {editingId ? "Update" : "Save"}
                </>}
              </button>

              <button onClick={handlePrint} disabled={isPrinting} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 6,
                background: T.accent, border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "opacity .15s", whiteSpace: "nowrap",
                opacity: isPrinting ? 0.7 : 1,
              }}>
                {isPrinting ? <><Spinner />Preparing…</> : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / PDF
                </>}
              </button>
            </div>
          </div>

          {/* ── INVOICE IDENTITY ── */}
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Invoice Details</SectionLabel>
            <div className="inv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <Input label="Invoice Number" value={inv.invoiceNumber} onChange={e => set({ invoiceNumber: e.target.value })} />
              <Input label="Date" value={inv.date} type="date" onChange={e => set({ date: e.target.value })} />
              <Input label="Supplier's Reference" value={inv.suppliersRef} onChange={e => set({ suppliersRef: e.target.value })} />
            </div>
          </Card>

          {/* ── SHIPMENT ── */}
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Shipment Details</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              <Input label="Buyer's Order No." value={inv.buyerOrderNo} onChange={e => set({ buyerOrderNo: e.target.value })} />
              <Input label="Dispatch Doc No." value={inv.dispatchDocNo} onChange={e => set({ dispatchDocNo: e.target.value })} />
              <Input label="Dispatched Through" value={inv.dispatchedThrough} onChange={e => set({ dispatchedThrough: e.target.value })} />
              <Input label="Terms of Delivery" value={inv.termsOfDelivery} onChange={e => set({ termsOfDelivery: e.target.value })} />
            </div>
          </Card>

          {/* ── SELLER / BUYER ── */}
          <div className="inv-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card>
              <PartySection
                title="Seller Details" gstin={inv.from.gstin}
                onGstinChange={e => { setGstError(er => ({ ...er, from: "" })); setInv(s => ({ ...s, from: { ...s.from, gstin: e.target.value.toUpperCase() } })); }}
                onFetch={() => fetchGST("from")} loading={gstLoading.from} error={gstError.from}
                fields={[
                  { label: "Company Name", key: "name", fullWidth: true },
                  { label: "Address", key: "address", fullWidth: true },
                  { label: "City", key: "city" },
                  { label: "State", key: "state" },
                  { label: "PIN Code", key: "zipCode" },
                  { label: "PAN", key: "pan", mono: true },
                ]}
                values={inv.from}
                onChange={(k, v) => setInv(s => ({ ...s, from: { ...s.from, [k]: v } }))}
              />
            </Card>
            <Card>
              <PartySection
                title="Buyer Details" gstin={inv.to.gstin}
                onGstinChange={e => { setGstError(er => ({ ...er, to: "" })); setInv(s => ({ ...s, to: { ...s.to, gstin: e.target.value.toUpperCase() } })); }}
                onFetch={() => fetchGST("to")} loading={gstLoading.to} error={gstError.to}
                fields={[
                  { label: "Client Name", key: "name", fullWidth: true },
                  { label: "Address", key: "address", fullWidth: true },
                  { label: "City", key: "city" },
                  { label: "State", key: "state" },
                  { label: "PIN Code", key: "zipCode" },
                ]}
                values={inv.to}
                onChange={(k, v) => setInv(s => ({ ...s, to: { ...s.to, [k]: v } }))}
              />
            </Card>
          </div>

          {/* ── LINE ITEMS ── */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: ".1em" }}>
                Line Items
              </span>
              <button className="inv-add-row"
                onClick={() => set({ items: [...inv.items, { description: "", hsn: "", quantity: 1, rate: 0, per: "Nos", amount: 0 }] })}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 5, cursor: "pointer",
                  border: `1px solid ${T.border}`,
                  background: "transparent", color: T.text3,
                  fontSize: 12, fontWeight: 600, transition: "all .15s",
                }}>
                + Add Row
              </button>
            </div>

            <ScrollShadow>
              {/* Header */}
              <div className="inv-item-cols" style={{ marginBottom: 6, padding: "0 6px" }}>
                {[
                  { label: "Description", align: "left" },
                  { label: "HSN / SAC", align: "center" },
                  { label: "Qty", align: "center" },
                  { label: "Rate (₹)", align: "right" },
                  { label: "Unit", align: "center" },
                  { label: "Amount (₹)", align: "right" },
                  { label: "", align: "left" },
                ].map((h, i) => (
                  <span key={i} style={{
                    fontSize: 10, fontWeight: 700, color: T.text4,
                    textTransform: "uppercase", letterSpacing: ".08em", textAlign: h.align,
                  }}>{h.label}</span>
                ))}
              </div>
              <div style={{ height: 1, background: T.border, marginBottom: 6 }} />

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {inv.items.map((item, idx) => (
                  <div key={idx} className="inv-row inv-item-cols" style={{
                    padding: "4px 4px", borderRadius: 5,
                    transition: "background .12s",
                    animation: `inv-fadeup .22s ease ${idx * .04}s both`,
                  }}>
                    <input className="inv-cell-input" value={item.description} placeholder="Item description"
                      onChange={e => updateItem(idx, "description", e.target.value)} style={cellInput()} />
                    <input className="inv-cell-input" value={item.hsn} placeholder="HSN"
                      onChange={e => updateItem(idx, "hsn", e.target.value)} style={cellInput({ textAlign: "center" })} />
                    <input className="inv-cell-input" type="number" value={item.quantity}
                      onChange={e => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)} style={cellInput({ textAlign: "center" })} />
                    <input className="inv-cell-input" type="number" value={item.rate}
                      onChange={e => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} style={cellInput({ textAlign: "right" })} />
                    <input className="inv-cell-input" value={item.per}
                      onChange={e => updateItem(idx, "per", e.target.value)} style={cellInput({ textAlign: "center" })} />
                    <div style={{
                      textAlign: "right", fontSize: 13.5, fontWeight: 600,
                      color: T.text1, fontVariantNumeric: "tabular-nums", padding: "10px 4px",
                    }}>
                      <AnimNum value={item.amount} />
                    </div>
                    {inv.items.length > 1
                      ? <button className="inv-del"
                        onClick={() => set({ items: inv.items.filter((_, i) => i !== idx) })}
                        style={{
                          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 4, border: "none", background: "transparent", color: T.text4,
                          cursor: "pointer", fontSize: 14, transition: "all .12s", flexShrink: 0,
                        }}>✕</button>
                      : <div />
                    }
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div style={{
                display: "flex", justifyContent: "flex-end", alignItems: "center",
                gap: 20, marginTop: 10, padding: "10px 8px 0",
                borderTop: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>Subtotal</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text1, fontVariantNumeric: "tabular-nums", minWidth: 110, textAlign: "right" }}>
                  <AnimNum value={subtotal} />
                </span>
                <div style={{ width: 36 }} />
              </div>
            </ScrollShadow>
          </Card>

          {/* ── NOTES + SUMMARY ── */}
          <div className="inv-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card>
              <SectionLabel>Declaration & Notes</SectionLabel>
              <Textarea label="Notes" value={inv.notes} onChange={e => set({ notes: e.target.value })} />
            </Card>
            <Card>
              <SectionLabel>Tax Summary</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <select value={inv.taxType} onChange={e => set({ taxType: e.target.value })} style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 5, padding: "6px 10px", fontSize: 12.5,
                      color: T.text2, fontWeight: 600, cursor: "pointer", outline: "none",
                    }}>
                      <option value="cgst_sgst">CGST + SGST</option>
                      <option value="igst">IGST</option>
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number"
                        value={isIGST ? inv.tax : inv.tax / 2}
                        onChange={e => { const v = parseFloat(e.target.value) || 0; set({ tax: isIGST ? v : v * 2 }); }}
                        style={{
                          width: 48, background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 5, padding: "6px 8px", fontSize: 13,
                          color: T.text1, fontWeight: 600, outline: "none", textAlign: "center",
                        }} />
                      <span style={{ fontSize: 13, color: T.text3 }}>%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text1, fontVariantNumeric: "tabular-nums" }}>
                    <AnimNum value={isIGST ? igstAmt : cgst} />
                  </span>
                </div>

                {!isIGST && (
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: 13, color: T.text3 }}>SGST @ {inv.tax / 2}%</span>
                    <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: "tabular-nums" }}>
                      <AnimNum value={sgst} />
                    </span>
                  </div>
                )}

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 13, color: T.text3 }}>Subtotal</span>
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: T.text2 }}>
                    <AnimNum value={subtotal} />
                  </span>
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: 14, marginTop: 2,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.text1 }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: T.accent, fontVariantNumeric: "tabular-nums" }}>
                    <AnimNum value={total} />
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── BANK DETAILS ── */}
          <Card>
            <SectionLabel>Bank Details</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 14 }}>
              {[
                ["bankName", "Bank Name", false],
                ["accountHolder", "Account Holder", false],
                ["accountNumber", "Account Number", true],
                ["confirmAccountNumber", "Confirm A/C No.", true],
              ].map(([key, label, mono]) => (
                <div key={key}>
                  <Input label={label} value={inv.bank[key] || ""} mono={mono}
                    onChange={e => setBank(key, e.target.value)}
                    style={
                      key === "confirmAccountNumber" &&
                        inv.bank.confirmAccountNumber &&
                        inv.bank.accountNumber !== inv.bank.confirmAccountNumber
                        ? { outline: `1px solid ${T.danger}`, borderRadius: 6 } : {}
                    } />
                  {key === "confirmAccountNumber" &&
                    inv.bank.confirmAccountNumber &&
                    inv.bank.accountNumber !== inv.bank.confirmAccountNumber &&
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: T.danger, fontWeight: 500 }}>Account numbers do not match</p>}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 14 }}>
              <Input label="IFSC Code" value={inv.bank.ifsc || ""} mono
                onChange={e => setBank("ifsc", e.target.value.toUpperCase())} />
              <Select label="Account Type" value={inv.bank.accountType} onChange={e => setBank("accountType", e.target.value)}>
                <option value="" disabled>Select type</option>
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
              </Select>
              <Input label="Branch" value={inv.bank.branch || ""} onChange={e => setBank("branch", e.target.value)} />
            </div>
          </Card>

          {/* ── Footer ── */}
          <div style={{ textAlign: "center", paddingTop: 32 }}>
            <a href="https://developersinfotech.in/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: T.text4, textDecoration: "none", transition: "color .15s" }}
              onMouseOver={e => e.target.style.color = T.text2}
              onMouseOut={e => e.target.style.color = T.text4}>
              Built by <strong style={{ fontWeight: 600 }}>Developers Infotech Pvt Ltd</strong>
            </a>
          </div>

        </div>
      </div>
    </>
  );
}