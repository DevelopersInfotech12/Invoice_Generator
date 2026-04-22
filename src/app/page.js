"use client";
import AuthGuard from "./auth/components/AuthGuard";
import InvoiceGenerator from "./components/InvoiceGenerator";

export default function HomePage() {
  return (
    <AuthGuard redirectTo="/login">
      <InvoiceGenerator />
    </AuthGuard>
  );
}