import { AuthProvider }  from "./auth/context/AuthContext";
import { ThemeProvider } from "./auth/context/ThemeContext";
import Navbar            from "./auth/components/Navbar";
import "./globals.css";

export const metadata = { title: "Invoice Generator" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/*
          Inline script runs before React hydrates — reads localStorage
          and sets data-theme on <html> immediately to prevent flash.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('inv-theme');
              if (saved === 'light' || saved === 'dark') {
                document.documentElement.setAttribute('data-theme', saved);
              } else {
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}