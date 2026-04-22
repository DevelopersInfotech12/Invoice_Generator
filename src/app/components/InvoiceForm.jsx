"use client";
import React, { useState } from "react";

const API_KEY  = "0563aa1121mshac8e837fdc8b3c9p1838c5jsnd2139ed3c4e2";
const API_HOST = "gst-insights-api.p.rapidapi.com";

function SectionTitle({ dot, children }) {
  return (
    <h3 className="inv-section-title">
      <span className="inv-section-dot" style={{ background: dot }} />
      {children}
    </h3>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      {label && <label className="inv-label">{label}</label>}
      {children}
    </div>
  );
}

// ── Main component — receives invoice state from parent ──
export default function InvoiceForm({ invoice, setInvoice, showToast }) {
  const [gstLoading, setGstLoading] = useState({ from: false, to: false });
  const [gstError,   setGstError]   = useState({ from: "",    to: ""   });

  const update     = (patch) => setInvoice(inv => ({ ...inv, ...patch }));
  const updateBank = (f, v)  => setInvoice(inv => ({ ...inv, bank: { ...inv.bank, [f]: v } }));

  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const isIGST   = invoice.taxType === "igst";
  const igstAmt  = subtotal * invoice.tax / 100;
  const cgst     = subtotal * invoice.tax / 200;
  const sgst     = subtotal * invoice.tax / 200;
  const taxAmt   = isIGST ? igstAmt : cgst + sgst;
  const total    = subtotal + taxAmt;

  const fetchGST = async (party) => {
    const gstin = invoice[party].gstin.trim();
    if (!gstin || gstin.length < 15) {
      setGstError(e => ({ ...e, [party]: "Enter a valid 15-digit GSTIN" }));
      return;
    }
    setGstError(e  => ({ ...e, [party]: "" }));
    setGstLoading(l => ({ ...l, [party]: true }));
    try {
      const res  = await fetch(`https://${API_HOST}/getGSTDetailsUsingGST/${gstin}`,
        { headers: { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST } });
      const json = await res.json();
      if (!json.success || !json.data?.length) {
        setGstError(e => ({ ...e, [party]: "No GST details found." }));
        return;
      }
      const rec  = json.data[0];
      const name = rec.tradeName || rec.legalName || "";
      const pan  = gstin.length === 15 ? gstin.slice(2, 12) : "";
      const addr = rec.principalAddress?.address || {};
      const line = [addr.buildingNumber, addr.buildingName, addr.floorNumber, addr.street, addr.location]
                    .filter(Boolean).join(", ");
      if (name) {
        setInvoice(inv => ({
          ...inv,
          [party]: {
            ...inv[party], name,
            address: line || inv[party].address,
            city:    addr.district || addr.location || inv[party].city,
            state:   addr.stateCode || inv[party].state,
            zipCode: addr.pincode   || inv[party].zipCode,
            ...(party === "from" ? { pan: pan || inv.from.pan } : {}),
          },
        }));
        showToast?.(`✓ ${party === "from" ? "Seller" : "Buyer"}: ${name}`);
      } else {
        setGstError(e => ({ ...e, [party]: "Could not extract business name." }));
      }
    } catch (err) {
      setGstError(e => ({ ...e, [party]: "API error: " + (err.message || "Unknown") }));
    } finally {
      setGstLoading(l => ({ ...l, [party]: false }));
    }
  };

  const updateItem = (idx, field, value) => {
    const items = invoice.items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "rate")
        updated.amount = (updated.quantity || 0) * (updated.rate || 0);
      return updated;
    });
    update({ items });
  };

  // Reusable GST row
  const GstRow = ({ party, accent, borderColor, bg }) => (
    <div style={{ marginBottom: 14 }}>
      <label className="inv-label" style={{ color: accent }}>GSTIN / UIN — auto-fill</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={invoice[party].gstin}
          placeholder="Enter 15-digit GSTIN"
          maxLength={15}
          onChange={e => {
            setGstError(er => ({ ...er, [party]: "" }));
            setInvoice(inv => ({ ...inv, [party]: { ...inv[party], gstin: e.target.value.toUpperCase() } }));
          }}
          className="inv-input inv-input--mono"
          style={{ flex: 1, borderColor, background: bg }}
        />
        <button
          className="inv-btn-gst"
          onClick={() => fetchGST(party)}
          disabled={gstLoading[party]}
          style={party === "to" ? { background: "#7C3AED", boxShadow: "0 2px 8px rgba(124,58,237,0.30)" } : {}}
        >
          {gstLoading[party]
            ? <><span className="inv-spinner" /> Fetching…</>
            : <>⚡ Fetch</>}
        </button>
      </div>
      {gstError[party] && <p className="inv-error">{gstError[party]}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Meta fields ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
        {[
          ["Buyer's Order No.",  "buyerOrderNo"],
          ["Dispatch Doc No.",   "dispatchDocNo"],
          ["Dispatched Through", "dispatchedThrough"],
        ].map(([label, key]) => (
          <Field key={key} label={label}>
            <input className="inv-input" type="text" value={invoice[key]}
              onChange={e => update({ [key]: e.target.value })} />
          </Field>
        ))}
      </div>

      <Field label="Terms of Delivery">
        <input className="inv-input" type="text" value={invoice.termsOfDelivery}
          onChange={e => update({ termsOfDelivery: e.target.value })} />
      </Field>

      {/* ── Seller / Buyer ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>

        {/* Seller */}
        <div style={{ background: "linear-gradient(160deg,#EFF6FF,#fff)", border: "1.5px solid #DBEAFE", borderRadius: 16, padding: 24 }}>
          <SectionTitle dot="#2563EB">From (Seller)</SectionTitle>
          <GstRow party="from" accent="#1D4ED8" borderColor="#93C5FD" bg="#F0F7FF" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["name","Company Name"],["address","Address"],["city","City"]].map(([k, ph]) => (
              <input key={k} className="inv-input" type="text" value={invoice.from[k]} placeholder={ph}
                style={{ borderColor: "#BFDBFE", background: "#F0F7FF" }}
                onChange={e => setInvoice(inv => ({ ...inv, from: { ...inv.from, [k]: e.target.value } }))} />
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["state","State"],["zipCode","ZIP"]].map(([k, ph]) => (
                <input key={k} className="inv-input" type="text" value={invoice.from[k]} placeholder={ph}
                  style={{ borderColor: "#BFDBFE", background: "#F0F7FF" }}
                  onChange={e => setInvoice(inv => ({ ...inv, from: { ...inv.from, [k]: e.target.value } }))} />
              ))}
            </div>
            <input className="inv-input inv-input--mono" type="text" value={invoice.from.pan} placeholder="PAN"
              style={{ borderColor: "#BFDBFE", background: "#F0F7FF" }}
              onChange={e => setInvoice(inv => ({ ...inv, from: { ...inv.from, pan: e.target.value.toUpperCase() } }))} />
          </div>
        </div>

        {/* Buyer */}
        <div style={{ background: "linear-gradient(160deg,#F5F3FF,#fff)", border: "1.5px solid #DDD6FE", borderRadius: 16, padding: 24 }}>
          <SectionTitle dot="#7C3AED">To (Buyer)</SectionTitle>
          <GstRow party="to" accent="#7C3AED" borderColor="#C4B5FD" bg="#FAF5FF" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["name","Client Name"],["address","Address"],["city","City"]].map(([k, ph]) => (
              <input key={k} className="inv-input" type="text" value={invoice.to[k]} placeholder={ph}
                style={{ borderColor: "#C4B5FD", background: "#FAF5FF" }}
                onChange={e => setInvoice(inv => ({ ...inv, to: { ...inv.to, [k]: e.target.value } }))} />
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["state","State"],["zipCode","ZIP"]].map(([k, ph]) => (
                <input key={k} className="inv-input" type="text" value={invoice.to[k]} placeholder={ph}
                  style={{ borderColor: "#C4B5FD", background: "#FAF5FF" }}
                  onChange={e => setInvoice(inv => ({ ...inv, to: { ...inv.to, [k]: e.target.value } }))} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <SectionTitle dot="#2563EB">Invoice Items</SectionTitle>
          <button className="inv-btn-primary"
            onClick={() => update({ items: [...invoice.items, { description: "", hsn: "", quantity: 1, rate: 0, per: "Nos", amount: 0 }] })}>
            + Add Item
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invoice.items.map((item, idx) => (
            <div key={idx} className="inv-item-row" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div style={{ display: "grid", gridTemplateColumns: "4fr 2fr 1fr 2fr 1fr auto", gap: 10, alignItems: "center" }}>
                <input className="inv-input" type="text" value={item.description}
                  onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Item description" />
                <input className="inv-input" type="text" value={item.hsn}
                  onChange={e => updateItem(idx, "hsn", e.target.value)} placeholder="HSN/SAC"
                  style={{ textAlign: "center" }} />
                <input className="inv-input" type="number" value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                  style={{ textAlign: "center" }} />
                <input className="inv-input" type="number" value={item.rate}
                  onChange={e => updateItem(idx, "rate", parseFloat(e.target.value) || 0)}
                  style={{ textAlign: "right" }} />
                <input className="inv-input" type="text" value={item.per}
                  onChange={e => updateItem(idx, "per", e.target.value)}
                  style={{ textAlign: "center" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", minWidth: 80, textAlign: "right" }}>
                    ₹{item.amount.toFixed(2)}
                  </span>
                  {invoice.items.length > 1 && (
                    <button
                      onClick={() => update({ items: invoice.items.filter((_, i) => i !== idx) })}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 6, borderRadius: 8, fontSize: 16, lineHeight: 1 }}
                    >✕</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notes + Summary ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        <Field label="Notes / Declaration">
          <textarea value={invoice.notes} onChange={e => update({ notes: e.target.value })}
            className="inv-input" style={{ minHeight: 160, resize: "vertical", lineHeight: 1.6 }} />
        </Field>
        <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="inv-total-row">
              <span style={{ fontSize: 14, color: "#64748B" }}>Subtotal</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="inv-total-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select value={invoice.taxType} onChange={e => update({ taxType: e.target.value })}
                    className="inv-input" style={{ width: "auto", padding: "5px 10px", fontSize: 13 }}>
                    <option value="cgst_sgst">CGST / SGST</option>
                    <option value="igst">IGST</option>
                  </select>
                  <input type="number"
                    value={isIGST ? invoice.tax : invoice.tax / 2}
                    onChange={e => { const v = parseFloat(e.target.value) || 0; update({ tax: isIGST ? v : v * 2 }); }}
                    className="inv-input" style={{ width: 60, textAlign: "center", padding: "5px 8px", fontSize: 13 }} />
                  <span style={{ fontSize: 13, color: "#64748B" }}>%</span>
                </div>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>₹{(isIGST ? igstAmt : cgst).toFixed(2)}</span>
              </div>
              {!isIGST && (
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontSize: 13, color: "#94A3B8" }}>SGST ({invoice.tax / 2}%)</span>
                  <span style={{ fontWeight: 500, color: "#0F172A" }}>₹{sgst.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="inv-total-row inv-total-final">
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Total Amount</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#2563EB" }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bank Details ── */}
      <div style={{ background: "linear-gradient(160deg,#ECFDF5,#fff)", border: "1.5px solid #A7F3D0", borderRadius: 16, padding: 24 }}>
        <SectionTitle dot="#059669">Bank Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {[
            ["bankName",             "Bank Name",           "text", "e.g. HDFC Bank",          false],
            ["accountHolder",        "Account Holder",      "text", "As per bank records",      false],
            ["accountNumber",        "Account Number",      "text", "e.g. 0123456789",          true ],
            ["confirmAccountNumber", "Confirm A/C No.",     "text", "Re-enter account number",  true ],
            ["ifsc",                 "IFSC Code",           "text", "e.g. HDFC0001234",         true ],
          ].map(([key, label, type, ph, mono]) => (
            <Field key={key} label={label}>
              <input type={type} value={invoice.bank[key]} placeholder={ph}
                onChange={e => updateBank(key, key === "ifsc" ? e.target.value.toUpperCase() : e.target.value)}
                className={`inv-input inv-input--green${mono ? " inv-input--mono" : ""}`}
                style={
                  key === "confirmAccountNumber" &&
                  invoice.bank.confirmAccountNumber &&
                  invoice.bank.accountNumber !== invoice.bank.confirmAccountNumber
                    ? { borderColor: "#EF4444" } : {}
                }
              />
              {key === "confirmAccountNumber" &&
               invoice.bank.confirmAccountNumber &&
               invoice.bank.accountNumber !== invoice.bank.confirmAccountNumber &&
               <p className="inv-error">Account numbers do not match</p>}
            </Field>
          ))}
          <Field label="Account Type">
            <select value={invoice.bank.accountType} onChange={e => updateBank("accountType", e.target.value)}
              className="inv-input inv-input--green" style={{ cursor: "pointer" }}>
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
            </select>
          </Field>
          <Field label="Branch" style={{ gridColumn: "1 / -1" }}>
            <input type="text" value={invoice.bank.branch} placeholder="e.g. Connaught Place, New Delhi"
              onChange={e => updateBank("branch", e.target.value)}
              className="inv-input inv-input--green" />
          </Field>
        </div>
      </div>

    </div>
  );
}