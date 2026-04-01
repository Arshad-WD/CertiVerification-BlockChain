"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getPublicContract } from "@/lib/blockchain";
import { Copy, Check, Info } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
  type: "Issued" | "Verified" | "Revoked";
  actor: string;
  timestamp: number;
  txHash: string;
}

export default function CertificateTimeline({ hash }: { hash: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, [hash]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const contract = getPublicContract();

      // 1. Fetch Issued
      const issueFilter = contract.filters.CertificateIssued(hash);
      const issueEvents = (await contract.queryFilter(issueFilter)) as ethers.EventLog[];
      
      // 2. Fetch Revoked
      const revokeFilter = contract.filters.CertificateRevoked(hash);
      const revokeEvents = (await contract.queryFilter(revokeFilter)) as ethers.EventLog[];

      // 3. Fetch Verified
      const verifyFilter = contract.filters.CertificateVerified(hash);
      const verifyEvents = (await contract.queryFilter(verifyFilter)) as ethers.EventLog[];

      let history: TimelineEvent[] = [];

      issueEvents.forEach(e => {
        history.push({
          type: "Issued",
          actor: e.args.issuer,
          timestamp: Number(e.args.timestamp),
          txHash: e.transactionHash
        });
      });

      // To find revoker, we need to check transaction
      for (const e of revokeEvents) {
        const tx = await e.getTransaction();
        history.push({
          type: "Revoked",
          actor: tx.from,
          timestamp: 0, // We'll sort by block number or fetch block
          txHash: e.transactionHash
        });
        // Get block for timestamp
        const block = await e.getBlock();
        history[history.length - 1].timestamp = block.timestamp;
      }

      for (const e of verifyEvents) {
        history.push({
          type: "Verified",
          actor: e.args.verifier,
          timestamp: Number(e.args.timestamp),
          txHash: e.transactionHash
        });
      }

      history.sort((a, b) => a.timestamp - b.timestamp);
      setEvents(history);
    } catch (err) {
      console.error("Timeline Error:", err);
    }
    setLoading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 24 }}>CERTIFICATE HISTORY</p>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "40%", height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: 8, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", animation: "shimmer 2s infinite" }} />
              </div>
              <div style={{ width: "20%", height: 10, background: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 32 }}>CERTIFICATE HISTORY</p>
      
      <div style={{ position: "relative" }}>
        {/* Vertical Line */}
        <div style={{ position: "absolute", left: 5, top: 0, bottom: 0, width: 2, background: "var(--border)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {events.map((ev, i) => (
            <motion.div 
              key={ev.txHash} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ position: "relative", paddingLeft: 32 }}
            >
              <div style={{ 
                position: "absolute", left: 0, top: 4, width: 12, height: 12, borderRadius: "50%",
                background: ev.type === "Verified" ? "transparent" : ev.type === "Issued" ? "var(--accent)" : "var(--danger)",
                border: ev.type === "Verified" ? "2px solid var(--info)" : "none",
                zIndex: 2,
                boxShadow: ev.type === "Issued" ? "0 0 10px var(--accent-glow)" : "none"
              }} />

              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.15em", marginBottom: 4 }}>{ev.type.toUpperCase()}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>
                  {new Date(ev.timestamp * 1000).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                
                <div 
                  onClick={() => copy(ev.actor)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "opacity .15s" }}
                  onMouseOver={e => e.currentTarget.style.opacity = ".7"}
                  onMouseOut={e => e.currentTarget.style.opacity = "1"}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--hash-color)" }}>
                    {ev.actor.slice(0, 10)}...{ev.actor.slice(-8)}
                  </span>
                  {copied === ev.actor ? <Check size={10} style={{ color: "var(--accent)" }} /> : <Copy size={10} style={{ color: "var(--text-muted)" }} />}
                </div>
              </div>
            </motion.div>
          ))}

          {events.length === 1 && (
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 2, top: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>NO FURTHER ACTIVITY</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
