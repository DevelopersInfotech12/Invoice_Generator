"use client";
import React, { useState } from "react";
import InvoicePrint from "./InvoicePrint";
import { invoiceApi } from "../auth/api/authApi";
import { useAuth } from "../auth/hooks/useAuth";
import { Toast, LoginModal } from "./InvoiceUIComponents";
import {
  InvoiceHeader, InvoiceIdentity, ShipmentDetails,
  PartyCards, LineItems, NotesSummary, BankDetails,
} from "./InvoiceFormSections";

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

  /* ── Derived totals ── */
  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
  const isIGST = inv.taxType === "igst";
  const igstAmt = subtotal * inv.tax / 100;
  const cgst = subtotal * inv.tax / 200;
  const sgst = subtotal * inv.tax / 200;
  const taxAmt = isIGST ? igstAmt : cgst + sgst;
  const total = subtotal + taxAmt;

  const set = p => setInv(s => ({ ...s, ...p }));
  const setBank = (f, v) => setInv(s => ({ ...s, bank: { ...s.bank, [f]: v } }));

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  /* ── Save / Update ── */
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

  /* ── Print ── */
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setTimeout(() => setIsPrinting(false), 500); }, 100);
  };

  /* ── New invoice ── */
  const handleNew = () => { setInv(defaultInvoice); setEditingId(null); setIsProforma(false); showToast("Started new invoice."); };

  /* ── GST fetch ── */
  const fetchGST = async party => {
    const gstin = inv[party].gstin.trim();
    if (!gstin || gstin.length < 15) { setGstError(e => ({ ...e, [party]: "Enter a valid 15-digit GSTIN" })); return; }
    setGstError(e => ({ ...e, [party]: "" })); setGstLoading(l => ({ ...l, [party]: true }));
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
            address: line || s[party].address, city: addr.district || addr.location || s[party].city,
            state: addr.stateCode || s[party].state, zipCode: addr.pincode || s[party].zipCode,
            ...(party === "from" ? { pan: pan || s.from.pan } : {}),
          }
        }));
        showToast(`${party === "from" ? "Seller" : "Buyer"}: ${name}`);
      } else setGstError(e => ({ ...e, [party]: "Could not extract business name." }));
    } catch (err) { setGstError(e => ({ ...e, [party]: "API error: " + (err.message || "Unknown") })); }
    finally { setGstLoading(l => ({ ...l, [party]: false })); }
  };

  /* ── Update item ── */
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        #inv-form, #inv-form * { font-family:'IBM Plex Sans',system-ui,sans-serif; box-sizing:border-box; }
        .inv-scroll-area-custom::-webkit-scrollbar { height:5px; }
        .inv-scroll-area-custom::-webkit-scrollbar-track { background:transparent; }
        .inv-scroll-area-custom::-webkit-scrollbar-thumb { background:#4B5563; border-radius:99px; }
        @keyframes inv-spin      { to { transform:rotate(360deg); } }
        @keyframes inv-fadeup    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes inv-slidedown { from { opacity:0; transform:translateY(-8px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }
        .inv-item-cols { display:grid; grid-template-columns:minmax(180px,3fr) 110px 90px 130px 80px 130px 36px; gap:8px; align-items:center; }
        .inv-cell-input:focus { border-color:#2563EB !important; box-shadow:0 0 0 2px rgba(37,99,235,0.08) !important; }
        .inv-row:hover   { background:var(--inv-surface-hover) !important; }
        .inv-btn-ghost:hover { border-color:#2563EB !important; color:#2563EB !important; }
        .inv-del:hover   { color:#DC2626 !important; background:rgba(220,38,38,0.08) !important; }
        .inv-add-row:hover { background:rgba(37,99,235,0.08) !important; border-color:rgba(37,99,235,0.25) !important; color:#2563EB !important; }
        input[type=date]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:.5; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        select option { background:var(--inv-bg); color:var(--inv-text1); }
        ::placeholder { color:var(--inv-text4) !important; opacity:1; }
        @media(max-width:900px) { .inv-2col { grid-template-columns:1fr !important; } }
        @media(max-width:660px) {
          .inv-hdr { flex-direction:column !important; }
          .inv-hdr-actions { width:100% !important; flex-wrap:wrap; }
          .inv-grid-3 { grid-template-columns:1fr 1fr !important; }
          .inv-bank-bottom { grid-template-columns:1fr !important; }
        }

      /* ── PRINT: hide everything except the invoice ── */
@media print {
  @page { size:A4; margin:0; }
  body { margin:1cm !important; }

  /* Hide EVERYTHING on the page first */
  body > * { display:none !important; }

  /* Then show only the print div */
  #inv-print { display:block !important; }
  #inv-print * { display:revert !important; }
}
      `}</style>

      <Toast toast={toast} />
      {loginPrompt && <LoginModal onClose={() => setLoginPrompt(false)} />}

      {/* ── Print view — only this shows when printing ── */}
      <div id="inv-print" style={{ display: "none" }}>
        <InvoicePrint invoice={inv} isProforma={isProforma}
          subtotal={subtotal} taxAmt={taxAmt} total={total}
          cgst={cgst} sgst={sgst} igstAmt={igstAmt} />
      </div>

      {/* ── Main form UI ── */}
      <div id="inv-form" style={{ minHeight: "100vh", background: "var(--inv-bg)", padding: "28px 20px 72px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <InvoiceHeader
            editingId={editingId} isProforma={isProforma}
            isSaving={isSaving} isPrinting={isPrinting}
            onToggleProforma={() => { setIsProforma(p => !p); showToast(isProforma ? "Switched to Tax Invoice" : "Switched to Proforma"); }}
            onSave={handleSave} onPrint={handlePrint} onNew={handleNew}
          />

          <InvoiceIdentity inv={inv} set={set} />
          <ShipmentDetails inv={inv} set={set} />
          <PartyCards inv={inv} setInv={setInv} gstLoading={gstLoading} gstError={gstError} setGstError={setGstError} fetchGST={fetchGST} />
          <LineItems inv={inv} set={set} updateItem={updateItem} subtotal={subtotal} />
          <NotesSummary inv={inv} set={set} isIGST={isIGST} igstAmt={igstAmt} cgst={cgst} sgst={sgst} subtotal={subtotal} total={total} />
          <BankDetails inv={inv} setBank={setBank} />

          {/* ── Footer ── */}
          <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 4 }}>
            <span style={{ fontSize: 15, color: "var(--inv-text4)" }}>
              Powered by:{" "}
              <a href="https://developersinfotech.in/" target="_blank" rel="noopener noreferrer"
                style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none",  }}
                onMouseOver={e => e.currentTarget.style.color = "#2563EB"}
                onMouseOut={e => e.currentTarget.style.color = "var(--inv-text3)"}>
                Invoice Wallah
              </a>
            </span>
          </div>

        </div>
      </div>
    </>
  );
}