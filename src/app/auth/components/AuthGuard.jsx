"use client";
// frontend/src/auth/components/AuthGuard.jsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth }   from "../hooks/useAuth.js";

export default function AuthGuard({ children, redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", background:"#0E0C09",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:16,
      }}>
        <div style={{
          width:44, height:44, borderRadius:"50%",
          border:"3px solid rgba(232,201,122,.15)",
          borderTopColor:"#E8C97A",
          animation:"spin .7s linear infinite",
        }}/>
        <p style={{ color:"#9A9080", fontSize:13, fontFamily:"'DM Sans',sans-serif", margin:0 }}>
          Authenticating…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) return null;
  return children;
}