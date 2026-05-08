// src/app/components/InvoiceFormSections.jsx
"use client";
import { T, Input, Textarea, AnimNum, SectionLabel, Card, Badge, Spinner, ScrollShadow, CustomSelect, PartySection } from "./InvoiceUIComponents";

/* ── Top Action Header ── */
export function InvoiceHeader({ editingId, isProforma, isSaving, isPrinting, onToggleProforma, onSave, onPrint, onNew }) {
  return (
    <div className="inv-hdr" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, marginBottom:28, animation:"inv-fadeup .35s ease both" }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, letterSpacing:"-.01em", background:"linear-gradient(135deg,#E8C97A,#B8913A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {editingId ? "Edit Invoice" : "New Invoice"}
          </h1>
          <Badge color={isProforma ? "#D97706" : T.accent}>
            {isProforma ? "Proforma" : "Tax Invoice"}
          </Badge>
        </div>
        <p style={{ margin:"4px 0 0", fontSize:13, color:T.text3 }}>
          {editingId ? `Editing invoice` : "Create and manage GST invoices"}
        </p>
      </div>

      <div className="inv-hdr-actions" style={{ display:"flex", gap:8, alignItems:"center" }}>
        <a href="/invoices" className="inv-btn-ghost" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:6, border:`1px solid ${T.border}`, background:"transparent", color:T.text2, fontSize:13, fontWeight:500, textDecoration:"none", transition:"all .15s", whiteSpace:"nowrap" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          My Invoices
        </a>

        {editingId && (
          <button onClick={onNew} className="inv-btn-ghost" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:6, border:`1px solid ${T.border}`, background:"transparent", color:T.text2, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New
          </button>
        )}

        <button onClick={onToggleProforma} className="inv-btn-ghost" style={{ padding:"8px 14px", borderRadius:6, border:`1px solid ${isProforma ? "#D97706" : T.border}`, background:isProforma?"rgba(217,119,6,0.08)":"transparent", color:isProforma?"#D97706":T.text2, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" }}>
          ⇄ {isProforma ? "Switch to Tax" : "Proforma"}
        </button>

        <button onClick={onSave} disabled={isSaving} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:6, background:T.successLt, border:`1px solid ${T.successBd}`, color:T.success, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" }}>
          {isSaving ? <><Spinner color={T.success}/>Saving…</> : <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {editingId ? "Update" : "Save"}
          </>}
        </button>

        <button onClick={onPrint} disabled={isPrinting} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:6, background:T.accent, border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", transition:"opacity .15s", whiteSpace:"nowrap", opacity:isPrinting?0.7:1 }}>
          {isPrinting ? <><Spinner/>Preparing…</> : <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / PDF
          </>}
        </button>
      </div>
    </div>
  );
}

/* ── Invoice Identity (number, date, ref) ── */
export function InvoiceIdentity({ inv, set }) {
  return (
    <Card style={{ marginBottom:16 }}>
      <SectionLabel>Invoice Details</SectionLabel>
      <div className="inv-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Input label="Invoice Number" value={inv.invoiceNumber} onChange={e=>set({invoiceNumber:e.target.value})}/>
        <Input label="Date" value={inv.date} type="date" onChange={e=>set({date:e.target.value})}/>
        <Input label="Supplier's Reference" value={inv.suppliersRef} onChange={e=>set({suppliersRef:e.target.value})}/>
      </div>
    </Card>
  );
}

/* ── Shipment details ── */
export function ShipmentDetails({ inv, set }) {
  return (
    <Card style={{ marginBottom:16 }}>
      <SectionLabel>Shipment Details</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
        <Input label="Buyer's Order No." value={inv.buyerOrderNo} onChange={e=>set({buyerOrderNo:e.target.value})}/>
        <Input label="Dispatch Doc No." value={inv.dispatchDocNo} onChange={e=>set({dispatchDocNo:e.target.value})}/>
        <Input label="Dispatched Through" value={inv.dispatchedThrough} onChange={e=>set({dispatchedThrough:e.target.value})}/>
        <Input label="Terms of Delivery" value={inv.termsOfDelivery} onChange={e=>set({termsOfDelivery:e.target.value})}/>
      </div>
    </Card>
  );
}

/* ── Seller / Buyer cards ── */
export function PartyCards({ inv, setInv, gstLoading, gstError, setGstError, fetchGST }) {
  return (
    <div className="inv-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      <Card>
        <PartySection title="Seller Details" gstin={inv.from.gstin}
          onGstinChange={e=>{ setGstError(er=>({...er,from:""})); setInv(s=>({...s,from:{...s.from,gstin:e.target.value.toUpperCase()}})); }}
          onFetch={()=>fetchGST("from")} loading={gstLoading.from} error={gstError.from}
          fields={[
            {label:"Company Name",key:"name",fullWidth:true},
            {label:"Address",key:"address",fullWidth:true},
            {label:"City",key:"city"},{label:"State",key:"state"},
            {label:"PIN Code",key:"zipCode"},{label:"PAN",key:"pan",mono:true},
          ]}
          values={inv.from}
          onChange={(k,v)=>setInv(s=>({...s,from:{...s.from,[k]:v}}))}
        />
      </Card>
      <Card>
        <PartySection title="Buyer Details" gstin={inv.to.gstin}
          onGstinChange={e=>{ setGstError(er=>({...er,to:""})); setInv(s=>({...s,to:{...s.to,gstin:e.target.value.toUpperCase()}})); }}
          onFetch={()=>fetchGST("to")} loading={gstLoading.to} error={gstError.to}
          fields={[
            {label:"Client Name",key:"name",fullWidth:true},
            {label:"Address",key:"address",fullWidth:true},
            {label:"City",key:"city"},{label:"State",key:"state"},
            {label:"PIN Code",key:"zipCode"},
          ]}
          values={inv.to}
          onChange={(k,v)=>setInv(s=>({...s,to:{...s.to,[k]:v}}))}
        />
      </Card>
    </div>
  );
}

/* ── Line Items table ── */
export function LineItems({ inv, set, updateItem, subtotal }) {
  return (
    <Card style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:".1em" }}>Line Items</span>
        <button className="inv-add-row"
          onClick={()=>set({items:[...inv.items,{description:"",hsn:"",quantity:1,rate:0,per:"Nos",amount:0}]})}
          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:5, cursor:"pointer", border:`1px solid ${T.border}`, background:"transparent", color:T.text3, fontSize:12, fontWeight:600, transition:"all .15s" }}>
          + Add Row
        </button>
      </div>

      <ScrollShadow>
        {/* Column headers */}
        <div className="inv-item-cols" style={{ marginBottom:6, padding:"0 6px" }}>
          {["Description","HSN / SAC","Qty","Rate (₹)","Unit","Amount (₹)",""].map((h,i)=>(
            <span key={i} style={{ fontSize:10, fontWeight:700, color:T.text4, textTransform:"uppercase", letterSpacing:".08em", textAlign:i>=2&&i<=5?"right":"left" }}>{h}</span>
          ))}
        </div>
        <div style={{ height:1, background:T.border, marginBottom:6 }}/>

        {/* Item rows */}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {inv.items.map((item,idx)=>(
            <div key={idx} className="inv-row inv-item-cols" style={{ padding:"4px 4px", borderRadius:5, transition:"background .12s" }}>
              <Input value={item.description} onChange={e=>updateItem(idx,"description",e.target.value)}/>
              <Input value={item.hsn} onChange={e=>updateItem(idx,"hsn",e.target.value)}/>
              <Input type="number" value={item.quantity} onChange={e=>updateItem(idx,"quantity",parseFloat(e.target.value)||0)}/>
              <Input type="number" value={item.rate} onChange={e=>updateItem(idx,"rate",parseFloat(e.target.value)||0)}/>
              <Input value={item.per} onChange={e=>updateItem(idx,"per",e.target.value)}/>
              <div style={{ textAlign:"right", fontSize:13.5, fontWeight:600, padding:"10px 4px" }}>
                <AnimNum value={item.amount}/>
              </div>
              {inv.items.length > 1
                ? <button onClick={()=>set({items:inv.items.filter((_,i)=>i!==idx)})} className="inv-del" style={{ width:32, height:32, border:"none", background:"transparent", cursor:"pointer", color:T.text4, borderRadius:4, transition:"all .15s" }}>✕</button>
                : <div/>
              }
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:20, marginTop:10, padding:"10px 8px 0", borderTop:`1px solid ${T.border}` }}>
          <span style={{ fontSize:13, color:T.text3, fontWeight:500 }}>Subtotal</span>
          <span style={{ fontSize:15, fontWeight:700, color:T.text1, fontVariantNumeric:"tabular-nums", minWidth:110, textAlign:"right" }}>
            <AnimNum value={subtotal}/>
          </span>
          <div style={{ width:36 }}/>
        </div>
      </ScrollShadow>
    </Card>
  );
}

/* ── Notes + Tax Summary ── */
export function NotesSummary({ inv, set, isIGST, igstAmt, cgst, sgst, subtotal, total }) {
  return (
    <div className="inv-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      <Card>
        <SectionLabel>Declaration &amp; Notes</SectionLabel>
        <Textarea label="Notes" value={inv.notes} onChange={e=>set({notes:e.target.value})}/>
      </Card>
      <Card>
        <SectionLabel>Tax Summary</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <select value={inv.taxType} onChange={e=>set({taxType:e.target.value})} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:5, padding:"6px 10px", fontSize:12.5, color:T.text2, fontWeight:600, cursor:"pointer", outline:"none" }}>
                <option value="cgst_sgst">CGST + SGST</option>
                <option value="igst">IGST</option>
              </select>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <input type="number"
                  value={isIGST ? inv.tax : inv.tax/2}
                  onChange={e=>{ const v=parseFloat(e.target.value)||0; set({tax:isIGST?v:v*2}); }}
                  style={{ width:48, background:T.surface, border:`1px solid ${T.border}`, borderRadius:5, padding:"6px 8px", fontSize:13, color:T.text1, fontWeight:600, outline:"none", textAlign:"center" }}/>
                <span style={{ fontSize:13, color:T.text3 }}>%</span>
              </div>
            </div>
            <span style={{ fontSize:14, fontWeight:600, color:T.text1, fontVariantNumeric:"tabular-nums" }}>
              <AnimNum value={isIGST ? igstAmt : cgst}/>
            </span>
          </div>

          {!isIGST && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:13, color:T.text3 }}>SGST @ {inv.tax/2}%</span>
              <span style={{ fontSize:13, color:T.text2, fontVariantNumeric:"tabular-nums" }}><AnimNum value={sgst}/></span>
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:13, color:T.text3 }}>Subtotal</span>
            <span style={{ fontSize:13, fontVariantNumeric:"tabular-nums", color:T.text2 }}><AnimNum value={subtotal}/></span>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, marginTop:2 }}>
            <span style={{ fontSize:15, fontWeight:700, color:T.text1 }}>Total</span>
            <span style={{ fontSize:24, fontWeight:700, color:T.accent, fontVariantNumeric:"tabular-nums" }}><AnimNum value={total}/></span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Bank Details ── */
export function BankDetails({ inv, setBank }) {
  return (
    <Card>
      <SectionLabel>Bank Details</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:14 }}>
        {[
          ["bankName","Bank Name",false],
          ["accountHolder","Account Holder",false],
          ["accountNumber","Account Number",true],
          ["confirmAccountNumber","Confirm A/C No.",true],
        ].map(([key,label,mono])=>(
          <div key={key}>
            <Input label={label} value={inv.bank[key]||""} mono={mono} onChange={e=>setBank(key,e.target.value)}
              style={key==="confirmAccountNumber"&&inv.bank.confirmAccountNumber&&inv.bank.accountNumber!==inv.bank.confirmAccountNumber?{outline:"1px solid #DC2626",borderRadius:6}:{}}/>
            {key==="confirmAccountNumber"&&inv.bank.confirmAccountNumber&&inv.bank.accountNumber!==inv.bank.confirmAccountNumber&&
              <p style={{ margin:"4px 0 0", fontSize:11, color:T.danger, fontWeight:500 }}>Account numbers do not match</p>}
          </div>
        ))}
      </div>
      <div className="inv-bank-bottom" style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:14 }}>
        <Input label="IFSC Code" value={inv.bank.ifsc||""} mono onChange={e=>setBank("ifsc",e.target.value.toUpperCase())}/>
        <Input label="Branch" value={inv.bank.branch||""} onChange={e=>setBank("branch",e.target.value)}/>
        <CustomSelect label="Account Type" value={inv.bank.accountType} onChange={v=>setBank("accountType",v)} options={["Current","Savings"]}/>
      </div>
    </Card>
  );
}