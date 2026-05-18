// src/app/components/InvoiceFormSections.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  T, Input, Textarea, AnimNum, SectionLabel,
  Card, Badge, Spinner, ScrollShadow,
  CustomSelect, PartySection,
} from "./InvoiceUIComponents";

/* ── Shared empty defaults ── */
const EMPTY_FROM = { name:"", address:"", city:"", state:"", zipCode:"", stateCode:"", gstin:"", pan:"" };
const EMPTY_TO   = { name:"", address:"", city:"", state:"", zipCode:"", gstin:"" };
const EMPTY_BANK = { bankName:"", accountHolder:"", accountNumber:"", confirmAccountNumber:"", ifsc:"", accountType:"Current", branch:"" };

/* ══════════════════════════════════════════════════════
   INVOICE HEADER — top action bar
══════════════════════════════════════════════════════ */
export function InvoiceHeader({
  editingId, isProforma, isSaving, isPrinting,
  onToggleProforma, onSave, onPrint, onNew,
}) {
  return (
    <div className="inv-hdr" style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:14, marginBottom:28, animation:"inv-fadeup .35s ease both",
    }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h1 style={{
            margin:0, fontSize:22, fontWeight:700, letterSpacing:"-.01em",
            background:"linear-gradient(135deg,#E8C97A,#B8913A)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>
            {editingId ? "Edit Invoice" : "New Invoice"}
          </h1>
          <Badge color={isProforma ? "#D97706" : T.accent}>
            {isProforma ? "Proforma" : "Tax Invoice"}
          </Badge>
        </div>
        <p style={{ margin:"4px 0 0", fontSize:13, color:T.text3 }}>
          {editingId ? "Editing invoice" : "Create and manage GST invoices"}
        </p>
      </div>

      <div className="inv-hdr-actions" style={{ display:"flex", gap:8, alignItems:"center" }}>
        {/* My Invoices */}
        <a href="/invoices" className="inv-btn-ghost" style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"8px 14px", borderRadius:6,
          border:`1px solid ${T.border}`, background:"transparent",
          color:T.text2, fontSize:13, fontWeight:500,
          textDecoration:"none", transition:"all .15s", whiteSpace:"nowrap",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          My Invoices
        </a>

        {/* New (only when editing) */}
        {editingId && (
          <button onClick={onNew} className="inv-btn-ghost" style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding:"8px 14px", borderRadius:6,
            border:`1px solid ${T.border}`, background:"transparent",
            color:T.text2, fontSize:13, fontWeight:500,
            cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New
          </button>
        )}

        {/* Proforma toggle */}
        <button onClick={onToggleProforma} className="inv-btn-ghost" style={{
          padding:"8px 14px", borderRadius:6,
          border:`1px solid ${isProforma ? "#D97706" : T.border}`,
          background: isProforma ? "rgba(217,119,6,0.08)" : "transparent",
          color: isProforma ? "#D97706" : T.text2,
          fontSize:13, fontWeight:500, cursor:"pointer",
          transition:"all .15s", whiteSpace:"nowrap",
        }}>
          ⇄ {isProforma ? "Switch to Tax" : "Proforma"}
        </button>

        {/* Save */}
        <button onClick={onSave} disabled={isSaving} style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"8px 16px", borderRadius:6,
          background:T.successLt, border:`1px solid ${T.successBd}`,
          color:T.success, fontSize:13, fontWeight:600,
          cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap",
        }}>
          {isSaving
            ? <><Spinner color={T.success}/>Saving…</>
            : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {editingId ? "Update" : "Save"}
              </>
          }
        </button>

        {/* Print */}
        <button onClick={onPrint} disabled={isPrinting} style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"8px 16px", borderRadius:6,
          background:T.accent, border:"none", color:"#fff",
          fontSize:13, fontWeight:600, cursor:"pointer",
          transition:"opacity .15s", whiteSpace:"nowrap",
          opacity: isPrinting ? 0.7 : 1,
        }}>
          {isPrinting
            ? <><Spinner/>Preparing…</>
            : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print / PDF
              </>
          }
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INVOICE IDENTITY — number, date, supplier ref
══════════════════════════════════════════════════════ */
export function InvoiceIdentity({ inv, set }) {
  return (
    <Card style={{ marginBottom:16 }}>
      <SectionLabel>Invoice Details</SectionLabel>
      <div className="inv-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Input label="Invoice Number"
          value={inv?.invoiceNumber || ""}
          onChange={e=>set({ invoiceNumber:e.target.value })}/>
        <Input label="Date" type="date"
          value={inv?.date || ""}
          onChange={e=>set({ date:e.target.value })}/>
        <Input label="Supplier's Reference"
          value={inv?.suppliersRef || ""}
          onChange={e=>set({ suppliersRef:e.target.value })}/>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   SHIPMENT DETAILS — accordion, default closed
══════════════════════════════════════════════════════ */
export function ShipmentDetails({ inv, set }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ marginBottom:16, padding:0, overflow:"hidden" }}>
      {/* Accordion header */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          width:"100%", display:"flex", alignItems:"center",
          justifyContent:"space-between",
          padding:"14px 22px", background:"transparent", border:"none",
          cursor:"pointer", textAlign:"left",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontSize:11, fontWeight:700, color:T.text3,
            textTransform:"uppercase", letterSpacing:".1em",
          }}>Shipment Details</span>
          <span style={{
            fontSize:10, color:T.text4, fontWeight:500,
            background:"rgba(0,0,0,.04)", border:`1px solid ${T.border}`,
            borderRadius:4, padding:"1px 7px",
          }}>Optional</span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={T.text4} strokeWidth="2.2"
          style={{ transform:open?"rotate(180deg)":"none", transition:"transform .25s ease", flexShrink:0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Accordion body */}
      <div style={{
        maxHeight: open ? 300 : 0,
        overflow:"hidden",
        transition:"max-height .3s ease",
      }}>
        <div style={{
          padding:"4px 22px 20px",
          borderTop:`1px solid ${T.border}`,
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:14,
          marginTop:14,
        }}>
          <Input label="Buyer's Order No. "
            value={inv?.buyerOrderNo || ""}
            onChange={e=>set({ buyerOrderNo:e.target.value })}/>
          <Input label="Dispatch Doc No. "
            value={inv?.dispatchDocNo || ""}
            onChange={e=>set({ dispatchDocNo:e.target.value })}/>
          <Input label="Dispatched Through "
            value={inv?.dispatchedThrough || ""}
            onChange={e=>set({ dispatchedThrough:e.target.value })}/>
          <Input label="Terms of Delivery"
            value={inv?.termsOfDelivery || ""}
            onChange={e=>set({ termsOfDelivery:e.target.value })}/>
        </div>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   PARTY CARDS — seller + buyer
══════════════════════════════════════════════════════ */
export function PartyCards({ inv, setInv, gstLoading, gstError, setGstError, fetchGST, onClearSeller }) {
  /* Safe defaults — prevents crash if from/to is undefined */
  const from = inv?.from || EMPTY_FROM;
  const to   = inv?.to   || EMPTY_TO;

  return (
    <div className="inv-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      {/* Seller */}
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:0 }}>
          <div style={{ flex:1 }}>
            <PartySection
              title="Seller Details"
              gstin={from.gstin || ""}
              onGstinChange={e=>{
                setGstError(er=>({...er,from:""}));
                setInv(s=>({...s, from:{...(s?.from||EMPTY_FROM), gstin:e.target.value.toUpperCase()}}));
              }}
              onFetch={()=>fetchGST("from")}
              loading={gstLoading.from}
              error={gstError.from}
              fields={[
                {label:"Company Name", key:"name",    fullWidth:true},
                {label:"Address",      key:"address", fullWidth:true},
                {label:"City",         key:"city"},
                {label:"State",        key:"state"},
                {label:"PIN Code",     key:"zipCode"},
                {label:"PAN",          key:"pan", mono:true},
              ]}
              values={from}
              onChange={(k,v)=>setInv(s=>({...s, from:{...(s?.from||EMPTY_FROM), [k]:v}}))}
              onClear={onClearSeller}
            />
          </div>
        </div>
      </Card>

      {/* Buyer */}
      <Card>
        <PartySection
          title="Buyer Details"
          gstin={to.gstin || ""}
          onGstinChange={e=>{
            setGstError(er=>({...er,to:""}));
            setInv(s=>({...s, to:{...(s?.to||EMPTY_TO), gstin:e.target.value.toUpperCase()}}));
          }}
          onFetch={()=>fetchGST("to")}
          loading={gstLoading.to}
          error={gstError.to}
          fields={[
            {label:"Client Name", key:"name",    fullWidth:true},
            {label:"Address",     key:"address", fullWidth:true},
            {label:"City",        key:"city"},
            {label:"State",       key:"state"},
            {label:"PIN Code",    key:"zipCode"},
          ]}
          values={to}
          onChange={(k,v)=>setInv(s=>({...s, to:{...(s?.to||EMPTY_TO), [k]:v}}))}
        />
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LINE ITEMS TABLE
══════════════════════════════════════════════════════ */
export function LineItems({ inv, set, updateItem, subtotal }) {
  const items = inv?.items || [];

  return (
    <Card style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:".1em" }}>
          Line Items
        </span>
        <button className="inv-add-row"
          onClick={()=>set({ items:[...items, {description:"",hsn:"",quantity:1,rate:0,per:"Nos",amount:0}] })}
          style={{
            display:"inline-flex", alignItems:"center", gap:5,
            padding:"6px 12px", borderRadius:5, cursor:"pointer",
            border:`1px solid ${T.border}`, background:"transparent",
            color:T.text3, fontSize:12, fontWeight:600, transition:"all .15s",
          }}>
          + Add Row
        </button>
      </div>

      <ScrollShadow>
        {/* Column headers */}
        <div className="inv-item-cols" style={{ marginBottom:6, padding:"0 6px" }}>
          {["Description","HSN / SAC","Qty","Rate (₹)","Unit","Amount (₹)",""].map((h,i)=>(
            <span key={i} style={{
              fontSize:10, fontWeight:700, color:T.text4,
              textTransform:"uppercase", letterSpacing:".08em",
              textAlign: i>=2&&i<=5 ? "right" : "left",
            }}>{h}</span>
          ))}
        </div>
        <div style={{ height:1, background:T.border, marginBottom:6 }}/>

        {/* Rows */}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {items.map((item,idx)=>(
            <div key={idx} className="inv-row inv-item-cols"
              style={{ padding:"4px 4px", borderRadius:5, transition:"background .12s" }}>
              <Input value={item?.description||""} onChange={e=>updateItem(idx,"description",e.target.value)}/>
              <Input value={item?.hsn||""}         onChange={e=>updateItem(idx,"hsn",e.target.value)}/>
              <Input type="number" value={item?.quantity??1} onChange={e=>updateItem(idx,"quantity",parseFloat(e.target.value)||0)}/>
              <Input type="number" value={item?.rate??0}     onChange={e=>updateItem(idx,"rate",parseFloat(e.target.value)||0)}/>
              <Input value={item?.per||"Nos"} onChange={e=>updateItem(idx,"per",e.target.value)}/>
              <div style={{ textAlign:"right", fontSize:13.5, fontWeight:600, padding:"10px 4px" }}>
                <AnimNum value={item?.amount||0}/>
              </div>
              {items.length > 1
                ? <button
                    onClick={()=>set({ items:items.filter((_,i)=>i!==idx) })}
                    className="inv-del"
                    style={{ width:32, height:32, border:"none", background:"transparent",
                      cursor:"pointer", color:T.text4, borderRadius:4, transition:"all .15s" }}>
                    ✕
                  </button>
                : <div/>
              }
            </div>
          ))}
        </div>

        {/* Subtotal row */}
        <div style={{
          display:"flex", justifyContent:"flex-end", alignItems:"center",
          gap:20, marginTop:10, padding:"10px 8px 0",
          borderTop:`1px solid ${T.border}`,
        }}>
          <span style={{ fontSize:13, color:T.text3, fontWeight:500 }}>Subtotal</span>
          <span style={{ fontSize:15, fontWeight:700, color:T.text1,
            fontVariantNumeric:"tabular-nums", minWidth:110, textAlign:"right" }}>
            <AnimNum value={subtotal||0}/>
          </span>
          <div style={{ width:36 }}/>
        </div>
      </ScrollShadow>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   NOTES + TAX SUMMARY
══════════════════════════════════════════════════════ */
export function NotesSummary({ inv, set, isIGST, igstAmt, cgst, sgst, subtotal, total }) {
  return (
    <div className="inv-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      {/* Notes */}
      <Card>
        <SectionLabel>Declaration &amp; Notes</SectionLabel>
        <Textarea label="Notes"
          value={inv?.notes || ""}
          onChange={e=>set({ notes:e.target.value })}/>
      </Card>

      {/* Summary */}
      <Card>
        <SectionLabel>Tax Summary</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column" }}>

          {/* Tax type + rate + amount */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 0", borderBottom:`1px solid ${T.border}`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <select
                value={inv?.taxType || "cgst_sgst"}
                onChange={e=>set({ taxType:e.target.value })}
                style={{
                  background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:5, padding:"6px 10px", fontSize:12.5,
                  color:T.text2, fontWeight:600, cursor:"pointer", outline:"none",
                }}>
                <option value="cgst_sgst">CGST + SGST</option>
                <option value="igst">IGST</option>
              </select>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <input
                  type="number"
                  value={isIGST ? (inv?.tax||0) : (inv?.tax||0)/2}
                  onChange={e=>{ const v=parseFloat(e.target.value)||0; set({ tax:isIGST?v:v*2 }); }}
                  style={{
                    width:48, background:T.surface, border:`1px solid ${T.border}`,
                    borderRadius:5, padding:"6px 8px", fontSize:13,
                    color:T.text1, fontWeight:600, outline:"none", textAlign:"center",
                  }}/>
                <span style={{ fontSize:13, color:T.text3 }}>%</span>
              </div>
            </div>
            <span style={{ fontSize:14, fontWeight:600, color:T.text1, fontVariantNumeric:"tabular-nums" }}>
              <AnimNum value={isIGST ? (igstAmt||0) : (cgst||0)}/>
            </span>
          </div>

          {/* SGST row */}
          {!isIGST && (
            <div style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"8px 0", borderBottom:`1px solid ${T.border}`,
            }}>
              <span style={{ fontSize:13, color:T.text3 }}>SGST @ {(inv?.tax||0)/2}%</span>
              <span style={{ fontSize:13, color:T.text2, fontVariantNumeric:"tabular-nums" }}>
                <AnimNum value={sgst||0}/>
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"8px 0", borderBottom:`1px solid ${T.border}`,
          }}>
            <span style={{ fontSize:13, color:T.text3 }}>Subtotal</span>
            <span style={{ fontSize:13, color:T.text2, fontVariantNumeric:"tabular-nums" }}>
              <AnimNum value={subtotal||0}/>
            </span>
          </div>

          {/* Total */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            paddingTop:14, marginTop:2,
          }}>
            <span style={{ fontSize:15, fontWeight:700, color:T.text1 }}>Total</span>
            <span style={{ fontSize:24, fontWeight:700, color:T.accent, fontVariantNumeric:"tabular-nums" }}>
              <AnimNum value={total||0}/>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BANK DETAILS — accordion, default closed, bank dropdown
══════════════════════════════════════════════════════ */

/* All Indian banks — static list (no external API needed,
   list is stable and exhaustive)                         */
const INDIAN_BANKS = [
  "Axis Bank","Bank of Baroda","Bank of India","Bank of Maharashtra",
  "Canara Bank","Central Bank of India","City Union Bank",
  "Corporation Bank","DBS Bank","DCB Bank","Dhanlaxmi Bank",
  "Federal Bank","HDFC Bank","ICICI Bank","IDBI Bank","IDFC First Bank",
  "Indian Bank","Indian Overseas Bank","IndusInd Bank","Jammu & Kashmir Bank",
  "Karnataka Bank","Karur Vysya Bank","Kotak Mahindra Bank","Lakshmi Vilas Bank",
  "Nainital Bank","Oriental Bank of Commerce","Punjab & Sind Bank",
  "Punjab National Bank","RBL Bank","South Indian Bank","Standard Chartered Bank",
  "State Bank of India","Syndicate Bank","Tamilnad Mercantile Bank",
  "UCO Bank","Union Bank of India","United Bank of India","Vijaya Bank",
  "Yes Bank","HSBC Bank","Citibank","Deutsche Bank","Bandhan Bank",
  "AU Small Finance Bank","Equitas Small Finance Bank","Jana Small Finance Bank",
  "Suryoday Small Finance Bank","Ujjivan Small Finance Bank",
  "ESAF Small Finance Bank","North East Small Finance Bank",
  "Paytm Payments Bank","Airtel Payments Bank","India Post Payments Bank",
  "Fino Payments Bank","Jio Payments Bank","NSDL Payments Bank",
];

function BankNameDropdown({ value, onChange }) {
  const [query,    setQuery]    = useState(value || "");
  const [open,     setOpen]     = useState(false);
  const [focused,  setFocused]  = useState(false);
  const ref = useRef(null);

  /* filter banks by search query */
  const filtered = query.length >= 1
    ? INDIAN_BANKS.filter(b => b.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : INDIAN_BANKS.slice(0, 12);

  /* close on outside click */
  useEffect(()=>{
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  },[]);

  const select = (bank) => {
    setQuery(bank);
    onChange(bank);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <label style={{ fontSize:11, fontWeight:600, color:T.text3,
        textTransform:"uppercase", letterSpacing:".06em",
        display:"block", marginBottom:5 }}>
        Bank Name (Optional)
      </label>
      <div style={{ position:"relative" }}>
        <input
          value={query}
          placeholder="Search bank…"
          onFocus={()=>{ setFocused(true); setOpen(true); }}
          onBlur={()=>setFocused(false)}
          onChange={e=>{ setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          style={{
            width:"100%", boxSizing:"border-box",
            background:T.surface,
            border:`1px solid ${focused ? T.accent : T.border}`,
            borderRadius:6, padding:"9px 32px 9px 11px",
            fontSize:13.5, color:T.text1,
            fontFamily:"inherit", outline:"none",
            transition:"border-color .15s, box-shadow .15s",
            boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
          }}
        />
        {/* Chevron */}
        <span style={{
          position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
          fontSize:14, color:T.text4, pointerEvents:"none",
        }}>▾</span>
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0,
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:6, marginTop:3,
          maxHeight:220, overflowY:"auto",
          boxShadow:"0 6px 24px rgba(0,0,0,0.12)",
          zIndex:9998,
        }}>
          {filtered.map(bank=>(
            <div key={bank}
              onMouseDown={()=>select(bank)}
              style={{
                padding:"9px 12px", fontSize:13.5,
                color: bank===value ? T.accent : T.text1,
                background: bank===value ? T.accentLt : "transparent",
                cursor:"pointer", fontWeight: bank===value ? 600 : 400,
                transition:"background .1s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=bank===value?T.accentLt:"var(--inv-surface-hover,rgba(0,0,0,.04))"}
              onMouseLeave={e=>e.currentTarget.style.background=bank===value?T.accentLt:"transparent"}
            >
              {bank}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BankDetails({ inv, setBank, onClear }) {
  const [open, setOpen] = useState(false);
  const bank = inv?.bank || EMPTY_BANK;

  return (
    <Card style={{ padding:0, overflow: open ? "visible" : "hidden" }}>
      {/* Accordion header */}
      <div style={{ display:"flex", alignItems:"center" }}>
        <button
          onClick={()=>setOpen(o=>!o)}
          style={{
            flex:1, display:"flex", alignItems:"center",
            justifyContent:"space-between",
            padding:"14px 22px", background:"transparent", border:"none",
            cursor:"pointer", textAlign:"left",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{
              fontSize:11, fontWeight:700, color:T.text3,
              textTransform:"uppercase", letterSpacing:".1em",
            }}>Bank Details</span>
            <span style={{
              fontSize:10, color:T.text4, fontWeight:500,
              background:"rgba(0,0,0,.04)", border:`1px solid ${T.border}`,
              borderRadius:4, padding:"1px 7px",
            }}>Optional</span>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={T.text4} strokeWidth="2.2"
            style={{ transform:open?"rotate(180deg)":"none", transition:"transform .25s ease", flexShrink:0 }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {/* Clear button — always visible in header */}
        {onClear && (
          <button onClick={onClear} title="Clear bank details" style={{
            display:"inline-flex", alignItems:"center", gap:4,
            padding:"5px 12px", margin:"0 14px 0 0", borderRadius:5, cursor:"pointer",
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.text4, fontSize:11, fontWeight:600, fontFamily:"inherit",
            transition:"all .15s", flexShrink:0,
          }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor="#DC2626"; e.currentTarget.style.color="#DC2626"; }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text4; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Accordion body */}
      <div style={{
        maxHeight: open ? 700 : 0,
        overflow: open ? "visible" : "hidden",
        transition:"max-height .35s ease",
      }}>
        <div style={{ padding:"4px 22px 22px", borderTop:`1px solid ${T.border}`, marginTop:0 }}>

          {/* Row 1: Bank Name dropdown, Account Holder, Account Number, Confirm */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:14, marginTop:14 }}>
            <BankNameDropdown
              value={bank.bankName || ""}
              onChange={v=>setBank("bankName", v)}
            />
            <Input label="Account Holder"
              value={bank.accountHolder || ""}
              onChange={e=>setBank("accountHolder", e.target.value)}/>
            <div>
              <Input label="Account Number "
                value={bank.accountNumber || ""}
                mono
                onChange={e=>setBank("accountNumber", e.target.value)}
                style={
                  bank.confirmAccountNumber &&
                  bank.accountNumber !== bank.confirmAccountNumber
                    ? {outline:"1px solid #DC2626", borderRadius:6} : {}
                }/>
            </div>
            <div>
              <Input label="Confirm A/C No. "
                value={bank.confirmAccountNumber || ""}
                mono
                onChange={e=>setBank("confirmAccountNumber", e.target.value)}
                style={
                  bank.confirmAccountNumber &&
                  bank.accountNumber !== bank.confirmAccountNumber
                    ? {outline:"1px solid #DC2626", borderRadius:6} : {}
                }/>
              {bank.confirmAccountNumber &&
               bank.accountNumber !== bank.confirmAccountNumber && (
                 <p style={{ margin:"4px 0 0", fontSize:11, color:"#DC2626", fontWeight:500 }}>
                   Account numbers do not match
                 </p>
               )}
            </div>
          </div>

          {/* Row 2: IFSC, Branch, Account Type */}
          <div className="inv-bank-bottom" style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:14 }}>
            <Input label="IFSC Code "
              value={bank.ifsc || ""}
              mono
              onChange={e=>setBank("ifsc", e.target.value.toUpperCase())}/>
            <Input label="Branch "
              value={bank.branch || ""}
              onChange={e=>setBank("branch", e.target.value)}/>
            <CustomSelect
              label="Account Type"
              value={bank.accountType || "Current"}
              onChange={v=>setBank("accountType", v)}
              options={["Current","Savings"]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}