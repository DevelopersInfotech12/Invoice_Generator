"use client";

import React, { useState } from "react";
import InvoicePrint from "./InvoicePrint";

const API_KEY = "0563aa1121mshac8e837fdc8b3c9p1838c5jsnd2139ed3c4e2";
const API_HOST = "gst-insights-api.p.rapidapi.com";

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase",
  letterSpacing: ".06em", marginBottom: 6,
};
const inputStyle = {
  background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "10px 14px", fontSize: 14,
  color: "#1e293b", outline: "none", width: "100%", boxSizing: "border-box",
};
const itemInput = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "8px 12px", fontSize: 14,
  color: "#1e293b", outline: "none", width: "100%", boxSizing: "border-box",
};
const partyCard = (bg, border) => ({
  background: `linear-gradient(135deg,${bg},white)`,
  border: `1px solid ${border}`, borderRadius: 16, padding: 24,
});
const partyInput = (bc) => ({
  background: "white", border: `1px solid ${bc}`,
  borderRadius: 10, padding: "10px 14px", fontSize: 14,
  color: "#1e293b", outline: "none", width: "100%", boxSizing: "border-box",
});
const SectionTitle = ({ color, children }) => (
  <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
    {children}
  </h3>
);

export const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  if (num === 0) return "Zero Rupees Only";
  const cvt = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + cvt(n % 100) : "");
  };
  let w = Math.floor(num), result = "";
  if (w >= 10000000) { result += cvt(Math.floor(w / 10000000)) + " Crore "; w %= 10000000; }
  if (w >= 100000) { result += cvt(Math.floor(w / 100000)) + " Lakh "; w %= 100000; }
  if (w >= 1000) { result += cvt(Math.floor(w / 1000)) + " Thousand "; w %= 1000; }
  if (w > 0) { result += cvt(w); }
  return result.trim() + " Rupees Only";
};

const defaultInvoice = {
  invoiceNumber: "",
  date: new Date().toISOString().split("T")[0],
  suppliersRef: "",
  buyerOrderNo: "",
  dispatchDocNo: "",
  dispatchedThrough: "",
  termsOfDelivery: "",
  from: { name: "", address: "", city: "", state: "", zipCode: "", stateCode: "", gstin: "", pan: "" },
  to: { name: "", address: "", city: "", state: "", zipCode: "", gstin: "" },
  items: [{ description: "", hsn: "", quantity: 1, rate: 0, per: "Nos", amount: 0 }],
  tax: 18,
  taxType: "cgst_sgst",
  notes: "We declare that this Invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [isProforma, setIsProforma] = useState(false);
  const [toast, setToast] = useState(null);
  const [gstLoading, setGstLoading] = useState({ from: false, to: false });
  const [gstError, setGstError] = useState({ from: "", to: "" });

  const showToast = (msg, color = "#4f46e5") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Computed totals (passed to print view) ───────────────────
  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const taxAmt = (subtotal * invoice.tax) / 100;
  const total = subtotal + taxAmt;

  // ── Items ────────────────────────────────────────────────────
  const updateItem = (idx, field, value) => {
    const items = [...invoice.items];
    items[idx][field] = value;
    if (field === "quantity" || field === "rate")
      items[idx].amount = (items[idx].quantity || 0) * (items[idx].rate || 0);
    setInvoice({ ...invoice, items });
  };
  const addItem = () => setInvoice({
    ...invoice,
    items: [...invoice.items, { description: "", hsn: "", quantity: 1, rate: 0, per: "Nos", amount: 0 }],
  });
  const removeItem = (idx) => {
    if (invoice.items.length > 1)
      setInvoice({ ...invoice, items: invoice.items.filter((_, i) => i !== idx) });
  };

  // ── GST auto-fill ────────────────────────────────────────────
  const fetchGST = async (party) => {
    const gstin = invoice[party].gstin.trim();
    if (!gstin || gstin.length < 15) {
      setGstError((e) => ({ ...e, [party]: "Enter a valid 15-digit GSTIN" }));
      return;
    }
    setGstError((e) => ({ ...e, [party]: "" }));
    setGstLoading((l) => ({ ...l, [party]: true }));
    try {
      const res = await fetch(`https://${API_HOST}/getGSTDetailsUsingGST/${gstin}`, {
        method: "GET",
        headers: { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST },
      });
      const json = await res.json();
      if (!json.success || !json.data?.length) {
        setGstError((e) => ({ ...e, [party]: "No GST details found." }));
        return;
      }
      const rec = json.data[0];
      const name = rec.tradeName || rec.legalName || "";
      const addr = rec.principalAddress?.address || {};
      const addressLine = [addr.buildingNumber, addr.buildingName, addr.floorNumber, addr.street, addr.location]
        .filter(Boolean).join(", ");
      const pan = party === "from" && gstin.length === 15 ? gstin.slice(2, 12) : undefined;

      if (name) {
        setInvoice((inv) => ({
          ...inv,
          [party]: {
            ...inv[party],
            name,
            address: addressLine || inv[party].address,
            city: addr.district || inv[party].city,
            state: addr.stateCode || inv[party].state,
            zipCode: addr.pincode || inv[party].zipCode,
            ...(pan !== undefined ? { pan } : {}),
          },
        }));
        showToast(`✓ ${party === "from" ? "Seller" : "Buyer"}: ${name}`, "#059669");
      } else {
        setGstError((e) => ({ ...e, [party]: "Could not extract name from response." }));
      }
    } catch (err) {
      setGstError((e) => ({ ...e, [party]: "API error: " + err.message }));
    } finally {
      setGstLoading((l) => ({ ...l, [party]: false }));
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-16px) translateX(-50%); }
          to   { opacity:1; transform:translateY(0) translateX(-50%); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .toast-anim { animation:slideDown 0.3s ease; }
        .spinner {
          animation:spin 0.7s linear infinite; display:inline-block;
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.4);
          border-top-color:white; border-radius:50%;
        }
        .inv-input { width:100%; box-sizing:border-box; }
        .header-actions     { display:flex; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:32px; }
        .header-brand       { display:flex; align-items:center; gap:12px; flex:1 1 auto; min-width:0; }
        .header-controls    { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
        .inv-header-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .inv-meta-grid      { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .seller-buyer-grid  { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .notes-summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .item-row { display:grid; grid-template-columns:4fr 2fr 1fr 2fr 1fr auto; gap:10px; align-items:center; }
        .item-amount-cell { display:flex; align-items:center; justify-content:space-between; gap:8px; white-space:nowrap; }
        .gst-row { display:flex; gap:8px; align-items:center; }
        .gst-fetch-btn {
          flex-shrink:0; padding:10px 14px; border-radius:10px; border:none;
          background:linear-gradient(135deg,#059669,#047857); color:white;
          font-weight:700; font-size:12px; cursor:pointer; white-space:nowrap;
          display:flex; align-items:center; gap:6px;
          box-shadow:0 2px 8px rgba(5,150,105,0.35); transition:opacity .2s;
        }
        .gst-fetch-btn:disabled { opacity:.65; cursor:not-allowed; }
        .gst-fetch-btn:hover:not(:disabled) { opacity:.9; }

        /* ════ PRINT STYLES ════ */
        @page {
          size: A4;
          margin: 10mm;
          /* Setting margin to a fixed value removes the browser's
             auto header (URL/title) and footer (page number) */
        }
        @media print {
          body { print-color-adjust:exact; -webkit-print-color-adjust:exact; margin:0 !important; padding:0 !important; }
          #invoice-form  { display:none !important; }
          #invoice-print { display:block !important; }
        }
        #invoice-print { display:none; }

        @media (max-width:768px) {
          .inv-header-grid,.inv-meta-grid { grid-template-columns:1fr 1fr; }
          .seller-buyer-grid,.notes-summary-grid { grid-template-columns:1fr; }
          .item-row { grid-template-columns:1fr 1fr; }
          .item-desc { grid-column:1/-1; }
        }
        @media (max-width:480px) {
          .inv-header-grid,.inv-meta-grid { grid-template-columns:1fr; }
          .item-row { grid-template-columns:1fr 1fr; }
          .item-desc { grid-column:1/-1; }
          .item-amount-cell { grid-column:1/-1; justify-content:space-between; }
        }
      `}</style>

      {/* ══ PRINT VIEW — hidden on screen, shown when printing ══ */}
      <div id="invoice-print">
        <InvoicePrint
          invoice={invoice}
          isProforma={isProforma}
          numberToWords={numberToWords}
          calculateSubtotal={() => subtotal}
          calculateTax={() => taxAmt}
          calculateTotal={() => total}
        />
      </div>

      {/* ══ SCREEN / EDIT FORM ══ */}
      <div id="invoice-form">
        {toast && (
          <div className="toast-anim" style={{
            position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999, display: "flex", alignItems: "center", gap: 8,
            background: "white", border: "1px solid #e2e8f0",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)", borderRadius: 12,
            padding: "12px 20px", whiteSpace: "nowrap",
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: toast.color, display: "inline-block" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{toast.msg}</span>
          </div>
        )}

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
          <div style={{ maxWidth: 1152, margin: "0 auto" }}>

            {/* ── Header bar ── */}
            <div className="header-actions">
              <div className="header-brand">
                <div style={{ width: 48, height: 48, flexShrink: 0, background: "linear-gradient(135deg,#2563eb,#4f46e5)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(79,70,229,.35)" }}>
                  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                    <line x1="9" y1="15" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: "clamp(1.25rem,4vw,1.875rem)", fontWeight: 800, background: "linear-gradient(90deg,#2563eb,#4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Invoice Generator</h1>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Create professional invoices instantly</p>
                </div>
              </div>
              <div className="header-controls">
                <button onClick={() => { setIsProforma(p => !p); showToast(!isProforma ? "Switched to Proforma Invoice" : "Switched to Tax Invoice"); }} style={{ padding: "10px 16px", borderRadius: 12, border: "2px solid", borderColor: isProforma ? "#4f46e5" : "#cbd5e1", color: isProforma ? "#4f46e5" : "#64748b", background: isProforma ? "#eef2ff" : "white", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>
                  {isProforma ? "Switch to Tax Invoice" : "Switch to Proforma"}
                </button>
                <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(79,70,229,.35)" }}>
                  🖨 Print / Download
                </button>
              </div>
            </div>

            {/* ── Main card ── */}
            <div style={{ background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(0,0,0,.1)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(226,232,240,.6)" }}>

              {/* Blue band */}
              <div style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", padding: "24px 32px" }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: ".05em" }}>
                    {isProforma ? "PROFORMA INVOICE" : "TAX INVOICE"}
                  </span>
                </div>
                <div className="inv-header-grid">
                  {[
                    { label: "Invoice Number", key: "invoiceNumber", type: "text" },
                    { label: "Date", key: "date", type: "date" },
                    { label: "Supplier's Ref", key: "suppliersRef", type: "text" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#bfdbfe", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{label}</label>
                      <input type={type} value={invoice[key]}
                        onChange={(e) => setInvoice({ ...invoice, [key]: e.target.value })}
                        className="inv-input"
                        style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Meta */}
                <div className="inv-meta-grid">
                  {[
                    { label: "Buyer's Order No.", key: "buyerOrderNo" },
                    { label: "Dispatch Doc No.", key: "dispatchDocNo" },
                    { label: "Dispatched Through", key: "dispatchedThrough" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="text" value={invoice[key]}
                        onChange={(e) => setInvoice({ ...invoice, [key]: e.target.value })}
                        className="inv-input" style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Terms of Delivery</label>
                  <input type="text" value={invoice.termsOfDelivery}
                    onChange={(e) => setInvoice({ ...invoice, termsOfDelivery: e.target.value })}
                    className="inv-input" style={inputStyle} />
                </div>

                {/* ── Seller / Buyer ── */}
                <div className="seller-buyer-grid">

                  {/* Seller */}
                  <div style={partyCard("#eff6ff", "#dbeafe")}>
                    <SectionTitle color="#2563eb">From (Seller)</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["name", "Company Name"], ["address", "Address"], ["city", "City"]].map(([k, ph]) => (
                        <input key={k} type="text" value={invoice.from[k]} placeholder={ph}
                          onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, [k]: e.target.value } })}
                          className="inv-input" style={partyInput("#dbeafe")} />
                      ))}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[["state", "State"], ["zipCode", "ZIP"]].map(([k, ph]) => (
                          <input key={k} type="text" value={invoice.from[k]} placeholder={ph}
                            onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, [k]: e.target.value } })}
                            className="inv-input" style={partyInput("#dbeafe")} />
                        ))}
                      </div>
                      {[["stateCode", "State Code"], ["pan", "PAN"]].map(([k, ph]) => (
                        <input key={k} type="text" value={invoice.from[k]} placeholder={ph}
                          onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, [k]: e.target.value } })}
                          className="inv-input" style={partyInput("#dbeafe")} />
                      ))}
                      <div>
                        <label style={{ ...labelStyle, color: "#1d4ed8", marginBottom: 6 }}>GSTIN / UIN — Auto-fill from GST</label>
                        <div className="gst-row">
                          <input type="text" value={invoice.from.gstin} placeholder="Enter GSTIN (15 digits)" maxLength={15}
                            onChange={(e) => { setGstError(err => ({ ...err, from: "" })); setInvoice({ ...invoice, from: { ...invoice.from, gstin: e.target.value.toUpperCase() } }); }}
                            className="inv-input" style={{ ...partyInput("#93c5fd"), letterSpacing: ".05em", fontFamily: "monospace", fontSize: 13 }}
                          />
                          <button className="gst-fetch-btn" onClick={() => fetchGST("from")} disabled={gstLoading.from}>
                            {gstLoading.from ? <><span className="spinner" /> Fetching…</> : <>⚡ Fetch</>}
                          </button>
                        </div>
                        {gstError.from && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{gstError.from}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Buyer */}
                  <div style={partyCard("#f5f3ff", "#e0e7ff")}>
                    <SectionTitle color="#4f46e5">To (Buyer)</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["name", "Client Name"], ["address", "Address"], ["city", "City"]].map(([k, ph]) => (
                        <input key={k} type="text" value={invoice.to[k]} placeholder={ph}
                          onChange={(e) => setInvoice({ ...invoice, to: { ...invoice.to, [k]: e.target.value } })}
                          className="inv-input" style={partyInput("#e0e7ff")} />
                      ))}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[["state", "State"], ["zipCode", "ZIP"]].map(([k, ph]) => (
                          <input key={k} type="text" value={invoice.to[k]} placeholder={ph}
                            onChange={(e) => setInvoice({ ...invoice, to: { ...invoice.to, [k]: e.target.value } })}
                            className="inv-input" style={partyInput("#e0e7ff")} />
                        ))}
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#4338ca", marginBottom: 6 }}>GSTIN / UIN — Auto-fill from GST</label>
                        <div className="gst-row">
                          <input type="text" value={invoice.to.gstin} placeholder="Enter GSTIN (15 digits)" maxLength={15}
                            onChange={(e) => { setGstError(err => ({ ...err, to: "" })); setInvoice({ ...invoice, to: { ...invoice.to, gstin: e.target.value.toUpperCase() } }); }}
                            className="inv-input" style={{ ...partyInput("#c4b5fd"), letterSpacing: ".05em", fontFamily: "monospace", fontSize: 13 }}
                          />
                          <button className="gst-fetch-btn" onClick={() => fetchGST("to")} disabled={gstLoading.to}
                            style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)", boxShadow: "0 2px 8px rgba(79,70,229,0.35)" }}>
                            {gstLoading.to ? <><span className="spinner" /> Fetching…</> : <>⚡ Fetch</>}
                          </button>
                        </div>
                        {gstError.to && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{gstError.to}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Items ── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                    <SectionTitle color="#2563eb">Invoice Items</SectionTitle>
                    <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,.3)" }}>
                      + Add Item
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {invoice.items.map((item, idx) => (
                      <div key={idx} style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                        <div className="item-row">
                          <input type="text" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Item description" className="inv-input item-desc" style={itemInput} />
                          <input type="text" value={item.hsn} onChange={(e) => updateItem(idx, "hsn", e.target.value)} placeholder="HSN" className="inv-input item-hsn" style={{ ...itemInput, textAlign: "center" }} />
                          <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)} placeholder="Qty" className="inv-input item-qty" style={{ ...itemInput, textAlign: "center" }} />
                          <input type="number" value={item.rate} onChange={(e) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} placeholder="Rate" className="inv-input item-rate" style={{ ...itemInput, textAlign: "right" }} />
                          <input type="text" value={item.per} onChange={(e) => updateItem(idx, "per", e.target.value)} placeholder="Unit" className="inv-input item-unit" style={{ ...itemInput, textAlign: "center" }} />
                          <div className="item-amount-cell">
                            <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>₹{item.amount.toFixed(2)}</span>
                            {invoice.items.length > 1 && (
                              <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 6, borderRadius: 8, display: "flex", alignItems: "center" }}>✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Notes + Summary ── */}
                <div className="notes-summary-grid">
                  <div>
                    <label style={labelStyle}>Notes / Declaration</label>
                    <textarea value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                      placeholder="Add any notes or terms here..."
                      style={{ width: "100%", boxSizing: "border-box", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#1e293b", resize: "vertical", minHeight: 160, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ color: "#64748b", fontWeight: 500 }}>Subtotal</span>
                        <span style={{ fontWeight: 700, fontSize: 18, color: "#1e293b" }}>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <select value={invoice.taxType || "cgst_sgst"} onChange={(e) => setInvoice({ ...invoice, taxType: e.target.value })}
                            style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 8px", fontSize: 13, color: "#1e293b", outline: "none" }}>
                            <option value="cgst_sgst">CGST / SGST</option>
                            <option value="igst">IGST</option>
                          </select>
                          <input type="number"
                            value={invoice.taxType === "igst" ? invoice.tax : invoice.tax / 2}
                            onChange={(e) => { const v = parseFloat(e.target.value) || 0; setInvoice({ ...invoice, tax: invoice.taxType === "igst" ? v : v * 2 }); }}
                            style={{ width: 56, background: "white", border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 8px", textAlign: "center", fontSize: 13, color: "#1e293b", outline: "none" }}
                          />
                          <span style={{ color: "#64748b" }}>%</span>
                        </div>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          ₹{(invoice.taxType === "igst" ? taxAmt : taxAmt / 2).toFixed(2)}
                        </span>
                      </div>
                      {(!invoice.taxType || invoice.taxType === "cgst_sgst") && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b" }}>SGST ({invoice.tax / 2}%)</span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>₹{(taxAmt / 2).toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "2px solid #cbd5e1" }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Total Amount</span>
                        <span style={{ fontWeight: 800, fontSize: "clamp(1.1rem,3vw,1.5rem)", background: "linear-gradient(90deg,#2563eb,#4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}