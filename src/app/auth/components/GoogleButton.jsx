"use client";
// frontend/src/auth/components/GoogleButton.jsx
import { useEffect, useRef, useState } from "react";
import { useAuth }   from "../hooks/useAuth.js";
import { useRouter } from "next/navigation";

export default function GoogleButton({ redirectTo = "/" }) {
  const { googleLogin } = useAuth();
  const router          = useRouter();
  const btnRef          = useRef(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("gsi-script")) { initGSI(); return; }
    const script  = document.createElement("script");
    script.id     = "gsi-script";
    script.src    = "https://accounts.google.com/gsi/client";
    script.async  = true;
    script.onload = initGSI;
    document.body.appendChild(script);
  }, []);

  function initGSI() {
    if (!window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id:            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback:             handleCredential,
      auto_select:          false,
      cancel_on_tap_outside:true,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      type:  "standard",
      theme: "filled_black",
      size:  "large",
      text:  "continue_with",
      width: btnRef.current.offsetWidth || 360,
    });
  }

  async function handleCredential({ credential }) {
    setError(""); setLoading(true);
    try {
      await googleLogin(credential);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div ref={btnRef} style={{ width:"100%", minHeight:44, borderRadius:10, overflow:"hidden" }}/>
      {loading && (
        <p style={{ textAlign:"center", fontSize:12, color:"#9A9080", margin:"6px 0 0",
          fontFamily:"'DM Sans',sans-serif" }}>
          Signing in with Google…
        </p>
      )}
      {error && (
        <p style={{ textAlign:"center", fontSize:12, color:"#F87171", margin:"6px 0 0",
          fontFamily:"'DM Sans',sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}