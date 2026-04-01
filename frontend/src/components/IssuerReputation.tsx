"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getPublicContract } from "@/lib/blockchain";
import { ShieldCheck, ChevronDown, ChevronUp, Star, Award, AlertCircle, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IssuerReputationProps {
  issuerAddress: string;
  small?: boolean;
}

export default function IssuerReputation({ issuerAddress, small = false }: IssuerReputationProps) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState({ issued: 0, revoked: 0, activeDays: 0 });
  const [tier, setTier] = useState({ label: "LOADING", color: "var(--text-muted)" });

  useEffect(() => {
    calculateReputation();
  }, [issuerAddress]);

  const calculateReputation = async () => {
    setLoading(true);
    try {
      const contract = getPublicContract();
      const owner = await contract.owner();

      // 1. Fetch all issuances by this issuer
      const issueFilter = contract.filters.CertificateIssued(null, issuerAddress);
      const issueEvents = (await contract.queryFilter(issueFilter)) as ethers.EventLog[];
      const issuedCount = issueEvents.length;

      // 2. Fetch all revocations
      // Since CertificateRevoked only has hash, we'd need to find if those hashes were issued by this issuer
      const allRevokeFilter = contract.filters.CertificateRevoked();
      const allRevokeEvents = (await contract.queryFilter(allRevokeFilter)) as ethers.EventLog[];
      
      let selfRevokes = 0;
      let ownerRevokes = 0;

      // Optimization: Create a set of hashes issued by this issuer
      const issuedHashes = new Set(issueEvents.map(e => e.args.hash));

      for (const revEvent of allRevokeEvents) {
        if (issuedHashes.has(revEvent.args.hash)) {
          // It was revoked. Now who revoked it?
          const tx = await revEvent.getTransaction();
          if (tx.from.toLowerCase() === owner.toLowerCase()) {
            ownerRevokes++;
          } else {
            selfRevokes++;
          }
        }
      }

      // 3. Active days
      let activeDays = 0;
      if (issuedCount > 0) {
        const firstIssue = Number(issueEvents[0].args.timestamp);
        activeDays = Math.floor((Date.now() / 1000 - firstIssue) / 86400);
      }

      // 4. Score Logic
      let s = 100;
      s += Math.min(60, issuedCount * 2);
      s -= (selfRevokes * 15);
      s -= (ownerRevokes * 25);
      if (activeDays > 30) s += 10;

      s = Math.max(0, Math.min(100, s));
      setScore(s);
      setStats({ issued: issuedCount, revoked: selfRevokes + ownerRevokes, activeDays });

      if (s >= 85) setTier({ label: "TRUSTED", color: "var(--accent)" });
      else if (s >= 60) setTier({ label: "ESTABLISHED", color: "var(--info)" });
      else if (s >= 35) setTier({ label: "PROVISIONAL", color: "var(--warn)" });
      else setTier({ label: "FLAGGED", color: "var(--danger)" });

    } catch (err) {
      console.error("Reputation Error:", err);
      setTier({ label: "ERROR", color: "var(--danger)" });
    }
    setLoading(false);
  };

  if (small) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", background: "var(--surface-3)", border: `1px solid ${tier.color}`, borderRadius: "var(--r-sm)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: tier.color }}>{tier.label}</span>
      </div>
    );
  }

  return (
    <div style={{ background: "transparent" }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "opacity .15s" }}
        onMouseOver={e => e.currentTarget.style.opacity = ".8"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "var(--surface-3)", border: `1px solid ${tier.color}`, borderRadius: "var(--r-sm)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: tier.color }}>{tier.label}</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} View Profile
        </span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 16, padding: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--hash-color)", marginBottom: 20 }}>{issuerAddress}</p>
              
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
                {loading ? (
                  <div style={{ width: 80, height: 48, background: "rgba(255,255,255,0.05)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", animation: "shimmer 2s infinite" }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 48, fontWeight: 700, fontFamily: "var(--font-space)", color: tier.color, lineHeight: 1 }}>{score}</span>
                )}
                <div style={{ paddingBottom: 6 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>REPUTATION SCORE</p>
                </div>
              </div>

              <div style={{ height: 3, width: "100%", background: "var(--border)", marginBottom: 24, position: "relative" }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: "100%", background: tier.color }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginBottom: 4 }}>ISSUED</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>{loading ? "..." : stats.issued}</p>
                </div>
                <div style={{ height: 20, width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginBottom: 4 }}>REVOKED</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: stats.revoked > 0 ? "var(--danger)" : "var(--text-muted)" }}>{loading ? "..." : stats.revoked}</p>
                </div>
                <div style={{ height: 20, width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginBottom: 4 }}>ACTIVE</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>{loading ? "..." : stats.activeDays}d</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
