import React from "react";

const numberToWords = (num) => {
  const ones  = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const tens  = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  if (num === 0) return "Zero Rupees Only";
  const cvt = n => {
    if (n===0) return "";
    if (n<10)  return ones[n];
    if (n<20)  return teens[n-10];
    if (n<100) return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
    return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+cvt(n%100):"");
  };
  let w=Math.floor(num),r="";
  if(w>=10000000){r+=cvt(Math.floor(w/10000000))+" Crore ";w%=10000000;}
  if(w>=100000)  {r+=cvt(Math.floor(w/100000))+" Lakh ";w%=100000;}
  if(w>=1000)    {r+=cvt(Math.floor(w/1000))+" Thousand ";w%=1000;}
  if(w>0)        {r+=cvt(w);}
  return r.trim()+" Rupees Only";
};

/*
  SINGLE MASTER TABLE APPROACH
  ─────────────────────────────
  The entire invoice is ONE <table> with ONE borderCollapse="collapse".
  Every <td> and <th> has exactly: border: "1px solid #000"
  No nested tables. No wrapper divs with borders.
  colspan and rowspan handle all layout.
  
  Grid: 12 equal columns (each ~8.33% wide)
  This gives enough granularity to approximate any column layout needed.
*/

const F = "Arial,Helvetica,sans-serif";
const B = "1px solid #000";

/* Every cell — border on all 4 sides, always */
const td = (extra={}) => ({
  border:        B,
  padding:       "4px 7px",
  fontFamily:    F,
  fontSize:      10,
  color:         "#000",
  verticalAlign: "top",
  lineHeight:    1.4,
  ...extra,
});

export default function InvoicePrint({
  invoice, isProforma, subtotal, taxAmt, total, cgst, sgst, igstAmt,
}) {
  const isIGST  = invoice.taxType === "igst";
  const rate    = invoice.tax;
  const half    = rate / 2;
  const bank    = invoice.bank || {};
  const hasBank = !!(bank.bankName || bank.accountNumber || bank.ifsc);

  /* Seller address block */
  const sellerBlock = [
    invoice.from.name     && <b key="n" style={{fontSize:12}}>{invoice.from.name}</b>,
    invoice.from.address  && <div key="a">{invoice.from.address}</div>,
    invoice.from.city     && <div key="c">{invoice.from.city}</div>,
    invoice.from.state    && <div key="s">{invoice.from.state}{invoice.from.zipCode?`, ${invoice.from.zipCode}`:""}</div>,
    invoice.from.stateCode&& <div key="sc">State Code: {invoice.from.stateCode}</div>,
    <div key="g">GSTIN/UIN: {invoice.from.gstin||"—"}</div>,
    invoice.from.pan      && <div key="p">PAN: {invoice.from.pan}</div>,
  ].filter(Boolean);

  /* Meta rows for right half of header */
  const metaRows = [
    ["Invoice No.",        invoice.invoiceNumber||"—"],
    ["Dated",              invoice.date||"—"],
    ["Supplier's Ref",     invoice.suppliersRef||"—"],
    ["Buyer's Order No.",  invoice.buyerOrderNo||"—"],
    ["Dispatch Doc No.",   invoice.dispatchDocNo||"—"],
    ["Dispatched Through", invoice.dispatchedThrough||"—"],
    ["Terms of Delivery",  invoice.termsOfDelivery||"—"],
  ];

  return (
    <div style={{
      background:"#fff",
      padding:"20px 24px",
      maxWidth:794,
      margin:"0 auto",
      fontFamily:F,
      fontSize:10,
      color:"#000",
      WebkitPrintColorAdjust:"exact",
      printColorAdjust:"exact",
    }}>

      {/* ── Title ── */}
      <h1 style={{
        textAlign:"center",fontSize:14,fontWeight:"bold",
        margin:"0 0 8px",fontFamily:F,
      }}>
        {isProforma?"Proforma Invoice":"Tax Invoice"}
      </h1>

      {/* ══════════════════════════════════════════════════════
          MASTER TABLE — everything below is rows of this table
      ══════════════════════════════════════════════════════ */}
      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        tableLayout:"fixed",
      }}>
        {/*
          12-column grid:
          col 1-6  = left half (seller / buyer info)
          col 7-12 = right half (meta / values)
          
          For items section:
          col 1-4  = description
          col 5-6  = HSN
          col 7    = Qty
          col 8-9  = Rate
          col 10   = Per
          col 11-12= Amount
        */}
        <colgroup>
          {Array.from({length:12},(_,i)=>(
            <col key={i} style={{width:"8.333%"}}/>
          ))}
        </colgroup>

        <tbody>

          {/* ── ROW 1: Seller (left) + Meta labels+values (right) ── */}
          {/* We use rowspan on seller cell to cover all 7 meta rows */}
          <tr>
            <td colSpan={6} rowSpan={7} style={td({ padding:10, verticalAlign:"top" })}>
              {sellerBlock}
            </td>
            {/* Meta row 1 — label */}
            <td colSpan={3} style={td({ fontWeight:"600" })}>{metaRows[0][0]}</td>
            <td colSpan={3} style={td()}>{metaRows[0][1]}</td>
          </tr>
          {/* Meta rows 2-7 */}
          {metaRows.slice(1).map(([label,value])=>(
            <tr key={label}>
              <td colSpan={3} style={td({ fontWeight:"600" })}>{label}</td>
              <td colSpan={3} style={td()}>{value}</td>
            </tr>
          ))}

          {/* ── BUYER ROW ── */}
          <tr>
            <td colSpan={12} style={td({ padding:"6px 7px" })}>
              <span style={{fontWeight:"600"}}>Buyer: </span>
              <span style={{fontWeight:"bold",fontSize:11}}>{invoice.to.name}</span>
              {invoice.to.address&&<span style={{marginLeft:6}}>{invoice.to.address}</span>}
              {invoice.to.city   &&<span style={{marginLeft:4}}>{invoice.to.city}</span>}
              {invoice.to.state  &&<span style={{marginLeft:4}}>{invoice.to.state}{invoice.to.zipCode?`, ${invoice.to.zipCode}`:""}</span>}
              {"  "}
              <span style={{fontWeight:"600"}}>GSTIN/UIN: </span>
              <span>{invoice.to.gstin||"—"}</span>
            </td>
          </tr>

          {/* ── ITEMS HEADER ── */}
          <tr>
            <th colSpan={4} style={td({ fontWeight:"bold", textAlign:"left",  padding:"5px 7px" })}>Description of Goods</th>
            <th colSpan={2} style={td({ fontWeight:"bold", textAlign:"center",padding:"5px 7px" })}>HSN/SAC</th>
            <th colSpan={1} style={td({ fontWeight:"bold", textAlign:"center",padding:"5px 7px" })}>Quantity</th>
            <th colSpan={2} style={td({ fontWeight:"bold", textAlign:"right", padding:"5px 7px" })}>Rate</th>
            <th colSpan={1} style={td({ fontWeight:"bold", textAlign:"center",padding:"5px 7px" })}>Per</th>
            <th colSpan={2} style={td({ fontWeight:"bold", textAlign:"right", padding:"5px 7px" })}>Amount</th>
          </tr>

          {/* ── ITEM ROWS ── */}
          {invoice.items.map((item,i)=>(
            <tr key={i}>
              <td colSpan={4} style={td()}>{item.description}</td>
              <td colSpan={2} style={td({textAlign:"center"})}>{item.hsn}</td>
              <td colSpan={1} style={td({textAlign:"center"})}>{item.quantity} {item.per}</td>
              <td colSpan={2} style={td({textAlign:"right"})}>{item.rate.toFixed(2)}</td>
              <td colSpan={1} style={td({textAlign:"center"})}>{item.per}</td>
              <td colSpan={2} style={td({textAlign:"right"})}>₹{item.amount.toFixed(2)}</td>
            </tr>
          ))}

          {/* ── SPACER + TAX ── */}
          <tr>
            <td colSpan={7} style={td({ height:70, verticalAlign:"top" })}>&nbsp;</td>
            <td colSpan={5} style={td({ verticalAlign:"bottom", padding:"6px 7px" })}>
              {isIGST ? (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>
                    <tr>
                      <td style={{fontFamily:F,fontSize:10,paddingBottom:1}}>IGST @ {rate}%</td>
                      <td style={{fontFamily:F,fontSize:10,textAlign:"right"}}>{igstAmt.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>
                    <tr>
                      <td style={{fontFamily:F,fontSize:10,paddingBottom:2}}>CGST @ {half}%</td>
                      <td style={{fontFamily:F,fontSize:10,textAlign:"right"}}>{cgst.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{fontFamily:F,fontSize:10}}>SGST @ {half}%</td>
                      <td style={{fontFamily:F,fontSize:10,textAlign:"right"}}>{sgst.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </td>
          </tr>

          {/* ── TOTAL ROW ── */}
          <tr>
            <td colSpan={10} style={td({fontWeight:"bold",padding:"5px 7px"})}>Total</td>
            <td colSpan={2}  style={td({fontWeight:"bold",textAlign:"right",padding:"5px 7px"})}>₹{total.toFixed(2)}</td>
          </tr>

          {/* ── AMOUNT IN WORDS ── */}
          <tr>
            <td colSpan={12} style={td({padding:"5px 7px"})}>
              <span style={{fontWeight:"600"}}>Amount in words: </span>
              {numberToWords(total)}
            </td>
          </tr>

          {/* ── BANK DETAILS (if any) ── */}
          {hasBank && (<>
            <tr>
              <td colSpan={3} style={td()}><span style={{fontWeight:"600"}}>Bank: </span>{bank.bankName}</td>
              <td colSpan={3} style={td()}><span style={{fontWeight:"600"}}>Holder: </span>{bank.accountHolder}</td>
              <td colSpan={3} style={td()}><span style={{fontWeight:"600"}}>A/C No.: </span>{bank.accountNumber}</td>
              <td colSpan={3} style={td()}><span style={{fontWeight:"600"}}>IFSC: </span>{bank.ifsc}</td>
            </tr>
            <tr>
              <td colSpan={3} style={td()}><span style={{fontWeight:"600"}}>Type: </span>{bank.accountType}</td>
              <td colSpan={9} style={td()}><span style={{fontWeight:"600"}}>Branch: </span>{bank.branch}</td>
            </tr>
          </>)}

          {/* ── PAN + E&OE ── */}
          <tr>
            <td colSpan={6} style={td()}>
              <span style={{fontWeight:"600"}}>Company's PAN: </span>{invoice.from.pan||"—"}
            </td>
            <td colSpan={6} style={td({textAlign:"right"})}>
              <span style={{fontWeight:"600"}}>E. &amp; O.E</span>
            </td>
          </tr>

          {/* ── TAX SUMMARY HEADER ROW 1 ── */}
          {isIGST ? (
            <>
              <tr>
                <th rowSpan={2} colSpan={3} style={td({fontWeight:"bold",textAlign:"right",verticalAlign:"middle"})}>Taxable Value</th>
                <th colSpan={3} style={td({fontWeight:"bold",textAlign:"center"})}>Integrated Tax</th>
                <th rowSpan={2} colSpan={6} style={td({fontWeight:"bold",textAlign:"right",verticalAlign:"middle"})}>Total Tax Amount</th>
              </tr>
              <tr>
                <th colSpan={1} style={td({fontWeight:"600",textAlign:"center"})}>Rate</th>
                <th colSpan={2} style={td({fontWeight:"600",textAlign:"right"})}>Amount</th>
              </tr>
              {/* Data row */}
              <tr>
                <td colSpan={3} style={td({textAlign:"right"})}>{subtotal.toFixed(2)}</td>
                <td colSpan={1} style={td({textAlign:"center"})}>{rate}%</td>
                <td colSpan={2} style={td({textAlign:"right"})}>{igstAmt.toFixed(2)}</td>
                <td colSpan={6} style={td({textAlign:"right"})}>{taxAmt.toFixed(2)}</td>
              </tr>
              {/* Total row */}
              <tr>
                <td colSpan={3} style={td({fontWeight:"bold",textAlign:"right"})}>Total: {subtotal.toFixed(2)}</td>
                <td colSpan={1} style={td()}></td>
                <td colSpan={2} style={td({fontWeight:"bold",textAlign:"right"})}>{igstAmt.toFixed(2)}</td>
                <td colSpan={6} style={td({fontWeight:"bold",textAlign:"right"})}>{taxAmt.toFixed(2)}</td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <th rowSpan={2} colSpan={2} style={td({fontWeight:"bold",textAlign:"right",verticalAlign:"middle"})}>Taxable Value</th>
                <th colSpan={4} style={td({fontWeight:"bold",textAlign:"center"})}>Central Tax</th>
                <th colSpan={4} style={td({fontWeight:"bold",textAlign:"center"})}>State Tax</th>
                <th rowSpan={2} colSpan={2} style={td({fontWeight:"bold",textAlign:"right",verticalAlign:"middle"})}>Total Tax Amount</th>
              </tr>
              <tr>
                <th colSpan={2} style={td({fontWeight:"600",textAlign:"center"})}>Rate</th>
                <th colSpan={2} style={td({fontWeight:"600",textAlign:"right"})}>Amount</th>
                <th colSpan={2} style={td({fontWeight:"600",textAlign:"center"})}>Rate</th>
                <th colSpan={2} style={td({fontWeight:"600",textAlign:"right"})}>Amount</th>
              </tr>
              {/* Data row */}
              <tr>
                <td colSpan={2} style={td({textAlign:"right"})}>{subtotal.toFixed(2)}</td>
                <td colSpan={2} style={td({textAlign:"center"})}>{half}%</td>
                <td colSpan={2} style={td({textAlign:"right"})}>{cgst.toFixed(2)}</td>
                <td colSpan={2} style={td({textAlign:"center"})}>{half}%</td>
                <td colSpan={2} style={td({textAlign:"right"})}>{sgst.toFixed(2)}</td>
                <td colSpan={2} style={td({textAlign:"right"})}>{taxAmt.toFixed(2)}</td>
              </tr>
              {/* Total row */}
              <tr>
                <td colSpan={2} style={td({fontWeight:"bold",textAlign:"right"})}>Total: {subtotal.toFixed(2)}</td>
                <td colSpan={2} style={td()}></td>
                <td colSpan={2} style={td({fontWeight:"bold",textAlign:"right"})}>{cgst.toFixed(2)}</td>
                <td colSpan={2} style={td()}></td>
                <td colSpan={2} style={td({fontWeight:"bold",textAlign:"right"})}>{sgst.toFixed(2)}</td>
                <td colSpan={2} style={td({fontWeight:"bold",textAlign:"right"})}>{taxAmt.toFixed(2)}</td>
              </tr>
            </>
          )}

          {/* ── TAX AMOUNT IN WORDS ── */}
          <tr>
            <td colSpan={12} style={td({padding:"5px 7px"})}>
              <span style={{fontWeight:"600"}}>Tax Amount (in words): </span>
              {numberToWords(taxAmt)}
            </td>
          </tr>

          {/* ── DECLARATION ── */}
          <tr>
            <td colSpan={12} style={td({padding:"6px 7px"})}>
              <p style={{fontWeight:"600",margin:"0 0 3px"}}>Declaration</p>
              <p style={{fontSize:9,margin:0,lineHeight:1.5}}>{invoice.notes}</p>
            </td>
          </tr>

          {/* ── SIGNATURE ── */}
          <tr>
            <td colSpan={6} style={td({padding:10,height:72,verticalAlign:"top"})}>
              <span style={{fontWeight:"600"}}>Customer's Seal and Signature</span>
            </td>
            <td colSpan={6} style={td({padding:10,textAlign:"right",verticalAlign:"top"})}>
              <p style={{fontWeight:"600",margin:"0 0 44px"}}>for {invoice.from.name}</p>
              <p style={{margin:0}}>Authorised Signatory</p>
            </td>
          </tr>

        </tbody>
      </table>

      <p style={{textAlign:"center",marginTop:10,fontSize:9,color:"#555",fontFamily:F}}>
        This is a Computer Generated Invoice
      </p>
    </div>
  );
}