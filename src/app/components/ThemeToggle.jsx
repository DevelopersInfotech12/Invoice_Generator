'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: "rgba(232,201,122,0.08)",
                border: "1px solid rgba(232,201,122,0.25)",
                color: "#E8C97A",
                cursor: "pointer",
                transition: "all .2s",
            }}
            onMouseOver={e => {
                e.currentTarget.style.background = "rgba(232,201,122,0.15)";
                e.currentTarget.style.borderColor = "rgba(232,201,122,0.4)";
            }}
            onMouseOut={e => {
                e.currentTarget.style.background = "rgba(232,201,122,0.08)";
                e.currentTarget.style.borderColor = "rgba(232,201,122,0.25)";
            }}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} strokeWidth={2.5} />
            ) : (
                <Moon size={20} strokeWidth={2.5} />
            )}
        </button>
    );
}