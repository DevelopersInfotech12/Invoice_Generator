import Link from "next/link";
import React from "react";

const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  if (!num || num === 0) return "Zero Rupees Only";
  const cvt = n => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + cvt(n % 100) : "");
  };
  let w = Math.floor(num), r = "";
  if (w >= 10000000) { r += cvt(Math.floor(w / 10000000)) + " Crore "; w %= 10000000; }
  if (w >= 100000) { r += cvt(Math.floor(w / 100000)) + " Lakh "; w %= 100000; }
  if (w >= 1000) { r += cvt(Math.floor(w / 1000)) + " Thousand "; w %= 1000; }
  if (w > 0) { r += cvt(w); }
  return r.trim() + " Rupees Only";
};

const F = "Arial, Helvetica, sans-serif";
const B = "1px solid #000";

const td = (extra = {}) => ({
  border: B, padding: "4px 7px",
  fontFamily: F, fontSize: 10, color: "#000",
  verticalAlign: "top", lineHeight: 1.4,
  ...extra,
});

export default function InvoicePrint({
  invoice, isProforma, subtotal, taxAmt, total, cgst, sgst, igstAmt,
}) {
  /* ── Null safety — guard every nested field ── */
  const from = invoice?.from || {};
  const to = invoice?.to || {};
  const bank = invoice?.bank || {};
  const items = invoice?.items || [];
  const notes = invoice?.notes || "";
  const isIGST = invoice?.taxType === "igst";
  const rate = invoice?.tax || 0;
  const half = rate / 2;
  const hasBank = !!(bank.bankName || bank.accountNumber || bank.ifsc);

  /* Safe number formatting */
  const fmt = (n) => (Number(n) || 0).toFixed(2);

  return (
    <div style={{
      background: "#fff",
      padding: "20px 24px",
      maxWidth: 794,
      margin: "0 auto",
      fontFamily: F,
      fontSize: 10,
      color: "#000",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }}>

      {/* ── Title ── */}
      <h1 style={{
        textAlign: "center", fontSize: 14, fontWeight: "bold",
        margin: "0 0 10px", fontFamily: F,
      }}>
        {isProforma ? "Proforma Invoice" : "Tax Invoice"}
      </h1>

      {/* ══ 1. SELLER + META ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "50%" }} /><col style={{ width: "50%" }} /></colgroup>
        <tbody>
          <tr>
            {/* Seller */}
            <td style={td({ padding: 10 })}>
              {from.name && <p style={{ fontWeight: "bold", fontSize: 12, margin: "0 0 2px" }}>{from.name}</p>}
              {from.address && <p style={{ margin: "1px 0" }}>{from.address}</p>}
              {from.city && <p style={{ margin: "1px 0" }}>{from.city}</p>}
              {from.state && <p style={{ margin: "1px 0" }}>{from.state}{from.zipCode ? `, ${from.zipCode}` : ""}</p>}
              {from.stateCode && <p style={{ margin: "1px 0" }}>State Code: {from.stateCode}</p>}
              <p style={{ margin: "3px 0 0" }}>GSTIN/UIN: {from.gstin || "—"}</p>
              {from.pan && <p style={{ margin: "1px 0" }}>PAN: {from.pan}</p>}
            </td>

            {/* Meta */}
            <td style={td({ padding: 0 })}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <colgroup><col style={{ width: "55%" }} /><col style={{ width: "45%" }} /></colgroup>
                <tbody>
                  {[
                    ["Invoice No.", invoice?.invoiceNumber || "—"],
                    ["Dated", invoice?.date || "—"],
                    ["Supplier's Ref", invoice?.suppliersRef || "—"],
                    ["Buyer's Order No.", invoice?.buyerOrderNo || "—"],
                    ["Dispatch Doc No.", invoice?.dispatchDocNo || "—"],
                    ["Dispatched Through", invoice?.dispatchedThrough || "—"],
                    ["Terms of Delivery", invoice?.termsOfDelivery || "—"],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={td({ fontWeight: "600" })}>{label}</td>
                      <td style={td()}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* Buyer */}
          <tr>
            <td colSpan={2} style={td({ padding: "6px 10px" })}>
              <span style={{ fontWeight: "600" }}>Buyer: </span>
              <span style={{ fontWeight: "bold", fontSize: 11 }}>{to.name || "—"}</span>
              {to.address && <span style={{ marginLeft: 6 }}>{to.address}</span>}
              {to.city && <span style={{ marginLeft: 4 }}>{to.city}</span>}
              {to.state && <span style={{ marginLeft: 4 }}>{to.state}{to.zipCode ? `, ${to.zipCode}` : ""}</span>}
              {"  "}
              <span style={{ fontWeight: "600" }}>GSTIN/UIN: </span>
              <span>{to.gstin || "—"}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ 2. LINE ITEMS ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "35%" }} /><col style={{ width: "10%" }} /><col style={{ width: "11%" }} />
          <col style={{ width: "12%" }} /><col style={{ width: "8%" }} /><col style={{ width: "24%" }} />
        </colgroup>
        <thead>
          <tr>
            {[["Description of Goods", "left"], ["HSN/SAC", "center"], ["Quantity", "center"],
            ["Rate", "right"], ["Per", "center"], ["Amount", "right"]].map(([h, a]) => (
              <th key={h} style={td({ fontWeight: "bold", padding: "5px 7px", textAlign: a })}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={td()}>{item?.description || ""}</td>
              <td style={td({ textAlign: "center" })}>{item?.hsn || ""}</td>
              <td style={td({ textAlign: "center" })}>{item?.quantity || 0} {item?.per || ""}</td>
              <td style={td({ textAlign: "right" })}>{fmt(item?.rate)}</td>
              <td style={td({ textAlign: "center" })}>{item?.per || ""}</td>
              <td style={td({ textAlign: "right" })}>₹{fmt(item?.amount)}</td>
            </tr>
          ))}

          {/* Spacer + tax */}
          <tr>
            <td colSpan={4} style={td({ height: 72 })}>&nbsp;</td>
            <td colSpan={2} style={td({ verticalAlign: "bottom", padding: "6px 7px" })}>
              {isIGST
                ? <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>IGST @ {rate}%</span><span>{fmt(igstAmt)}</span>
                </div>
                : <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span>CGST @ {half}%</span><span>{fmt(cgst)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>SGST @ {half}%</span><span>{fmt(sgst)}</span>
                  </div>
                </>}
            </td>
          </tr>

          {/* Total */}
          <tr>
            <td colSpan={5} style={td({ fontWeight: "bold", padding: "5px 7px" })}>Total</td>
            <td style={td({ fontWeight: "bold", textAlign: "right", padding: "5px 7px" })}>
              ₹{fmt(total)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ 3. AMOUNT IN WORDS + BANK ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={td({ padding: "5px 7px" })}>
              <span style={{ fontWeight: "600" }}>Amount in words: </span>
              {numberToWords(total)}
            </td>
          </tr>
          {hasBank && (
            <tr>
              <td style={td({ padding: 0 })}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "25%" }} /><col style={{ width: "25%" }} />
                    <col style={{ width: "25%" }} /><col style={{ width: "25%" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={td()}><b>Bank:</b> {bank.bankName || "—"}</td>
                      <td style={td()}><b>Holder:</b> {bank.accountHolder || "—"}</td>
                      <td style={td()}><b>A/C No.:</b> {bank.accountNumber || "—"}</td>
                      <td style={td()}><b>IFSC:</b> {bank.ifsc || "—"}</td>
                    </tr>
                    <tr>
                      <td style={td()}><b>Type:</b> {bank.accountType || "—"}</td>
                      <td colSpan={3} style={td()}><b>Branch:</b> {bank.branch || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ══ 4. PAN + E&OE ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "50%" }} /><col style={{ width: "50%" }} /></colgroup>
        <tbody>
          <tr>
            <td style={td()}>
              <span style={{ fontWeight: "600" }}>Company's PAN: </span>{from.pan || "—"}
            </td>
            <td style={td({ textAlign: "right" })}>
              <span style={{ fontWeight: "600" }}>E. &amp; O.E</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ 5. TAX SUMMARY ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th rowSpan={2} style={td({ textAlign: "right", fontWeight: "bold", padding: "4px 7px", width: "20%" })}>
              Taxable Value
            </th>
            {isIGST
              ? <th colSpan={2} style={td({ textAlign: "center", fontWeight: "bold" })}>Integrated Tax</th>
              : <>
                <th colSpan={2} style={td({ textAlign: "center", fontWeight: "bold" })}>Central Tax</th>
                <th colSpan={2} style={td({ textAlign: "center", fontWeight: "bold" })}>State Tax</th>
              </>}
            <th rowSpan={2} style={td({ textAlign: "right", fontWeight: "bold", padding: "4px 7px", width: "20%" })}>
              Total Tax Amt
            </th>
          </tr>
          <tr>
            <th style={td({ textAlign: "center", fontWeight: "600", width: "10%" })}>Rate</th>
            <th style={td({ textAlign: "right", fontWeight: "600", width: "15%" })}>Amount</th>
            {!isIGST && <>
              <th style={td({ textAlign: "center", fontWeight: "600", width: "10%" })}>Rate</th>
              <th style={td({ textAlign: "right", fontWeight: "600", width: "15%" })}>Amount</th>
            </>}
          </tr>
        </thead>
        <tbody>
          {[false, true].map(isBold => (
            <tr key={String(isBold)}>
              <td style={td({ textAlign: "right", fontWeight: isBold ? "bold" : "normal" })}>
                {isBold ? `Total: ${fmt(subtotal)}` : fmt(subtotal)}
              </td>
              {isIGST
                ? <>
                  <td style={td({ textAlign: "center" })}>{isBold ? "" : rate + "%"}</td>
                  <td style={td({ textAlign: "right", fontWeight: isBold ? "bold" : "normal" })}>{fmt(igstAmt)}</td>
                </>
                : <>
                  <td style={td({ textAlign: "center" })}>{isBold ? "" : half + "%"}</td>
                  <td style={td({ textAlign: "right", fontWeight: isBold ? "bold" : "normal" })}>{fmt(cgst)}</td>
                  <td style={td({ textAlign: "center" })}>{isBold ? "" : half + "%"}</td>
                  <td style={td({ textAlign: "right", fontWeight: isBold ? "bold" : "normal" })}>{fmt(sgst)}</td>
                </>}
              <td style={td({ textAlign: "right", fontWeight: isBold ? "bold" : "normal" })}>{fmt(taxAmt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ══ 6. TAX IN WORDS ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={td({ padding: "5px 7px" })}>
              <span style={{ fontWeight: "600" }}>Tax Amount (in words): </span>
              {numberToWords(taxAmt)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ 7. DECLARATION ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={td({ padding: "6px 7px" })}>
              <p style={{ fontWeight: "600", margin: "0 0 3px" }}>Declaration</p>
              <p style={{ fontSize: 9, margin: 0, lineHeight: 1.5 }}>{notes}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ 8. SIGNATURE ══ */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "50%" }} /><col style={{ width: "50%" }} /></colgroup>
        <tbody>
          <tr>
            <td style={td({ padding: 10, height: 72, verticalAlign: "top" })}>
              <span style={{ fontWeight: "600" }}>Customer's Seal and Signature</span>
            </td>
            <td style={td({ padding: 10, textAlign: "right", verticalAlign: "top" })}>
              <p style={{ fontWeight: "600", margin: "0 0 44px" }}>for {from.name || ""}</p>
              <p style={{ margin: 0 }}>Authorised Signatory</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ══ Computer generated ══ */}
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 9, color: "#555", fontFamily: F }}>
        This is a Computer Generated Invoice
      </p>

      {/* ══ PDF Footer ══ */}
      <div style={{
        marginTop: 12, paddingTop: 8,
        borderTop: "1px solid #ddd",
        textAlign: "center",
        fontFamily: F, fontSize: 8, color: "#888",
      }}>
        <Link href="https://www.invoicewallah.online/" target="_blank" rel="noopener noreferrer"
          style={{ color: "#888", textDecoration: "none" }}>
          Powered by: <span style={{ fontWeight: "bold", color: "#555" }}>Invoice Wallah</span>
        </Link>
      </div>

    </div>
  );
}