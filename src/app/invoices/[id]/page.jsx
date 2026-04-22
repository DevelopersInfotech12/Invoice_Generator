"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "../../auth/components/AuthGuard";
import InvoiceGenerator from "../../components/InvoiceGenerator";
import { invoiceApi } from "../../auth/api/authApi";

const C = {
  bg:"#0E0C09", gold:"#E8C97A", text3:"#9A9080", red:"#F87171",
};

function EditContent() {
  const { id } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!id) return;
    invoiceApi.getOne(id)
      .then(data => setInvoiceData(data.invoice))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", background:C.bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:16,
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{
          width:44, height:44, borderRadius:"50%",
          border:"3px solid rgba(232,201,122,.15)",
          borderTopColor:C.gold,
          animation:"spin .7s linear infinite",
        }}/>
        <p style={{ color:C.text3, fontSize:13, margin:0 }}>Loading invoice…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight:"100vh", background:C.bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:12,
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <p style={{ color:C.red, fontSize:15, fontWeight:600, margin:0 }}>
          {error}
        </p>
        <a href="/invoices" style={{ color:C.gold, fontSize:13, textDecoration:"underline" }}>
          ← Back to My Invoices
        </a>
      </div>
    );
  }

  return <InvoiceGenerator initialData={invoiceData} />;
}

export default function EditInvoicePage() {
  return (
    <AuthGuard redirectTo="/login">
      <EditContent />
    </AuthGuard>
  );
}