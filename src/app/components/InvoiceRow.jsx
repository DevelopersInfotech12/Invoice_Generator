"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { invoiceApi } from "../auth/api/authApi";

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

export const SpinIcon = ({ color="#fff" }) => (
  <span style={{ display:"inline-block", width:11, height:11,
    border:"2px solid " + color + "44", borderTopColor:color,
    borderRadius:"50%", animation:"ispin .7s linear infinite" }}/>
);
export const DownloadIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
export const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
export const CopyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
export const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

export function EmptyState({ hasFilter, onClear }) {
  return (
    <tr>
      <td colSpan={7} style={{ textAlign:"center", padding:"80px 20px" }}>
        <div style={{
          width:72, height:72, borderRadius:18, margin:"0 auto 16px",
          background:"rgba(232,201,122,.08)", border:"1px solid rgba(232,201,122,.2)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A8874A" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        {hasFilter ? (
          <>
            <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"var(--inv-text1)" }}>No invoices match</h3>
            <p style={{ margin:"0 0 20px", fontSize:13, color:"var(--inv-text3)" }}>Try a different search or filter.</p>
            <button onClick={onClear} style={{
              padding:"9px 18px", borderRadius:9, border:"1px solid var(--inv-border)",
              background:"transparent", color:"var(--inv-text2)", fontSize:13, cursor:"pointer", fontFamily:"inherit",
            }}>Clear filters</button>
          </>
        ) : (
          <>
            <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"var(--inv-text1)" }}>No invoices yet</h3>
            <p style={{ margin:"0 0 20px", fontSize:13, color:"var(--inv-text3)" }}>Create your first invoice to see it here.</p>
            <a href="/" style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"11px 22px", borderRadius:11, textDecoration:"none",
              background:"linear-gradient(135deg,#E8C97A,#B8913A)",
              color:"#1A1008", fontSize:13, fontWeight:800,
              boxShadow:"0 4px 18px rgba(232,201,122,.28)",
            }}>+ Create Invoice</a>
          </>
        )}
      </td>
    </tr>
  );
}

export function InvoiceRow({
  invoice, serial,
  onDelete, onDuplicate, onPin, onDownload, onBuyerClick,
  deleting, duplicating, pinning, downloading,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const date = invoice.date
    ? new Date(invoice.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "—";
  const total = invoice.total
    ? "₹" + Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits:2 })
    : "₹0.00";

  const btnBase = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:3,
    padding:"3px 7px", borderRadius:5, fontSize:11, fontWeight:600,
    cursor:"pointer", fontFamily:"inherit", border:"none",
    transition:"all .15s", whiteSpace:"nowrap", lineHeight:"18px",
  };

  return (
    <tr className={`inv-tr${invoice.isPinned ? " inv-tr-pinned" : ""}`}>
      {/* # */}
      <td className="inv-td inv-td-serial" style={{ textAlign:"center" }}>
        <span style={{ fontSize:12, color:"var(--inv-text4)", fontWeight:600 }}>
          {invoice.isPinned ? "📌" : serial}
        </span>
      </td>

      {/* Type badge */}
      <td className="inv-td" style={{ textAlign:"center" }}>
        <span style={{
          fontSize:9, fontWeight:800, letterSpacing:".08em",
          textTransform:"uppercase", color:C.gold,
          background:"rgba(232,201,122,0.12)", border:"1px solid rgba(232,201,122,0.28)",
          padding:"2px 7px", borderRadius:20, whiteSpace:"nowrap",
        }}>
          {invoice.isProforma ? "Proforma" : "Tax Inv"}
        </span>
      </td>

      {/* Invoice # */}
      <td className="inv-td" style={{ textAlign:"center" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#000000a4" }}>
          {invoice.invoiceNumber || "Untitled"}
        </span>
      </td>

      {/* Date */}
      <td className="inv-td inv-col-date" style={{ textAlign:"center" }}>
        <span style={{ fontSize:12, color:"var(--inv-text3)", whiteSpace:"nowrap" }}>{date}</span>
      </td>

      {/* Buyer */}
      <td className="inv-td inv-col-buyer" style={{ textAlign:"center" }}>
        {invoice.to?.name
          ? (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={() => onBuyerClick(invoice.to.name)} style={{
                background:"none", border:"none", padding:0, cursor:"pointer",
                fontSize:13, color:C.blue, fontWeight:500, fontFamily:"inherit",
                textDecoration:"underline", textDecorationColor:"rgba(96,165,250,.35)",
                textAlign:"center", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                display:"block",
              }}>{invoice.to.name}</button>
            </div>
          )
          : <span style={{ color:"var(--inv-text4)", fontSize:13 }}>—</span>}
      </td>

      {/* Total */}
      <td className="inv-td" style={{ textAlign:"center" }}>
        <span style={{ fontSize:14, fontWeight:800, color:C.gold,
          fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{total}</span>
      </td>

      {/* Actions */}
      <td className="inv-td inv-td-actions">
        <div style={{ display:"flex", gap:3, alignItems:"center", justifyContent:"center" }}>
          {confirmDelete ? (
            <>
              <button onClick={() => setConfirmDelete(false)}
                style={{...btnBase, background:"var(--inv-surface)", color:"var(--inv-text3)",
                  border:"1px solid var(--inv-border)", padding:"3px 10px"}}>
                Cancel
              </button>
              <button onClick={() => { onDelete(invoice._id); setConfirmDelete(false); }} disabled={deleting}
                style={{...btnBase, background:"rgba(248,113,113,.15)", color:C.red,
                  border:"1px solid rgba(248,113,113,.3)", padding:"3px 10px"}}>
                {deleting ? "…" : "Confirm"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onPin(invoice._id)} disabled={pinning}
                title={invoice.isPinned ? "Unpin" : "Pin"}
                style={{...btnBase, padding:"3px 6px",
                  background: invoice.isPinned ? "rgba(232,201,122,.15)" : "transparent",
                  color: invoice.isPinned ? C.gold : "var(--inv-text4)",
                  border:"1px solid "+(invoice.isPinned ? "rgba(232,201,122,0.30)" : "var(--inv-border)")}}>
                {pinning ? "…" : (invoice.isPinned ? "📌" : "📍")}
              </button>

              <button onClick={() => onDownload(invoice._id)} disabled={downloading}
                title="Download PDF"
                style={{...btnBase, background:"rgba(167,139,250,.10)", color:C.purple,
                  border:"1px solid rgba(167,139,250,.22)"}}>
                {downloading ? <SpinIcon color={C.purple}/> : <><DownloadIcon/> PDF</>}
              </button>

              <button onClick={() => router.push("/invoices/"+invoice._id)}
                className="inv-btn-edit" title="Edit"
                style={{...btnBase, background:"rgba(232,201,122,0.10)", color:C.gold,
                  border:"1px solid rgba(232,201,122,0.30)"}}>
                <EditIcon/> Edit
              </button>

              <button onClick={() => onDuplicate(invoice)} disabled={duplicating}
                className="inv-btn-dup" title="Duplicate"
                style={{...btnBase, background:"rgba(96,165,250,.10)", color:C.blue,
                  border:"1px solid rgba(96,165,250,.22)"}}>
                {duplicating ? <SpinIcon color={C.blue}/> : <><CopyIcon/> Duplicate</>}
              </button>

              <button onClick={() => setConfirmDelete(true)}
                className="inv-btn-del" title="Delete"
                style={{...btnBase, padding:"3px 6px", background:"rgba(248,113,113,.07)",
                  color:"var(--inv-text4)", border:"1px solid rgba(248,113,113,.18)"}}>
                <TrashIcon/>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}