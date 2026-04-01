"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, Wallet, Loader2, Menu, X, Activity } from "lucide-react";
import { ethers } from "ethers";

export default function Navbar() {
  const pathname = usePathname();
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((a: string[]) => a[0] && setAccount(a[0]));
      window.ethereum.on("accountsChanged", (a: string[]) => setAccount(a[0] ?? null));
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask to continue.");
    setConnecting(true);
    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      const a = await p.send("eth_requestAccounts", []);
      setAccount(a[0]);
    } catch (err) {
      console.error("Connection failed:", err);
    }
    setConnecting(false);
  };

  const links = [
    { href: "/", label: "Verify" },
    { href: "/issuer", label: "Issue" },
    { href: "/gallery", label: "Gallery" }
  ];

  return (
    <nav style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 40px)", maxWidth: "1180px", zIndex: 1000,
      background: scrolled ? "rgba(13,17,26,0.65)" : "rgba(13,17,26,0.35)",
      backdropFilter: "blur(24px)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 0,
      padding: "12px 24px",
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: scrolled ? "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset" : "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ 
            width: 32, height: 32, background: "var(--bg)", border: "1px solid var(--neon-cyan)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 15px var(--glow-cyan)"
          }}>
            <ShieldCheck size={18} style={{ color: "var(--neon-cyan)" }} />
          </div>
          <span className="terminal-header" style={{ fontSize: 16, color: "var(--t1)" }}>
            CertChain<span style={{ color: "var(--neon-cyan)" }}>_</span>
          </span>
        </Link>

        {/* LINKS */}
        <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 0 }}>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ 
                fontSize: 11, fontWeight: 700, padding: "8px 16px", textDecoration: "none",
                fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                color: active ? "var(--bg)" : "var(--t2)",
                background: active ? "var(--neon-cyan)" : "transparent",
                transition: "all 0.2s ease"
              }}>
                {label.toUpperCase()}
              </Link>
            );
          })}
        </div>

        {/* WALLET */}
        {account ? (
          <div style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "8px 16px",
            background: "rgba(0,255,180,0.03)", border: "1px solid rgba(0,255,180,0.15)",
            borderRadius: 0
          }}>
            <div className="status-dot" style={{ background: "var(--neon-emerald)" }} />
            <span className="mono-data" style={{ fontSize: 12, color: "var(--neon-emerald)" }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        ) : (
          <button onClick={connect} disabled={connecting} className="btn-cyber" style={{ height: 36, padding: "0 16px", fontSize: 11 }}>
            {connecting ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
            {connecting ? "SYNCING..." : "CONNECT HUB"}
          </button>
        )}

      </div>
    </nav>
  );
}
