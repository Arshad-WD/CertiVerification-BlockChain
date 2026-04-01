"use client";

import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { getPublicContract } from "@/lib/blockchain";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, FileText, CheckCircle2, XCircle, 
  ArrowUpRight, Shield, Activity, Users, Database, 
  BarChart3, Globe, Zap, Clock
} from "lucide-react";
import IssuerReputation from "@/components/IssuerReputation";

interface CertificateEntry {
  hash: string;
  name: string;
  title: string;
  issuer: string;
  timestamp: number;
  cid: string;
  isValid: boolean;
}

const BentoStat = ({ label, value, icon: Icon, color, delay }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
      className="bento-card" 
      style={{ padding: 32, flex: 1, minWidth: 260 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
         <div style={{ width: 32, height: 32, borderRadius: 0, background: "rgba(0,0,0,0.3)", border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
           <Icon size={16} style={{ color }} />
         </div>
         <span className="terminal-header" style={{ fontSize: 9, color: "var(--t3)" }}>{label}</span>
      </div>
      <div className="mono-data" style={{ fontSize: 32, fontWeight: 800, color: "var(--t1)" }}>{value}</div>
    </motion.div>
  );
};

export default function GalleryPage() {
  const [certs, setCerts] = useState<CertificateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "valid" | "revoked">("all");
  const [stats, setStats] = useState({ total: 0, valid: 0, revoked: 0 });

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const contract = getPublicContract();
      const issueFilter = contract.filters.CertificateIssued();
      const events = (await contract.queryFilter(issueFilter)) as ethers.EventLog[];
      
      const allCerts: CertificateEntry[] = [];
      let validCount = 0;
      let revokedCount = 0;

      for (const ev of events) {
        const a = ev.args;
        const info = await contract.certificates(a.hash);
        
        const cert = {
          hash: a.hash,
          name: a.name,
          title: a.title,
          issuer: a.issuer,
          timestamp: Number(a.timestamp),
          cid: a.cid,
          isValid: info.isValid
        };
        
        allCerts.push(cert);
        if (info.isValid) validCount++;
        else revokedCount++;
      }

      allCerts.sort((a, b) => b.timestamp - a.timestamp);
      setCerts(allCerts);
      setStats({ total: allCerts.length, valid: validCount, revoked: revokedCount });
    } catch (err) {
      console.error("Gallery Error:", err);
    }
    setLoading(false);
  };

  const filteredCerts = certs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.issuer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : filter === "valid" ? c.isValid : !c.isValid;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="cyber-overlay">
      <div className="scanline" />
      <Navbar />

      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", paddingTop: "120px", paddingBottom: "120px", paddingLeft: "32px", paddingRight: "32px" }}>
        
        {/* ── BENTO STATS HEADER ── */}
        <header style={{ marginBottom: "var(--section-spacing)" }}>
           <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                 <span className="terminal-header" style={{ color: "var(--neon-cyan)", fontSize: 11, display: "block", marginBottom: 12 }}>Protocol // Global Archive</span>
                 <h2 className="terminal-header" style={{ fontSize: 40, letterSpacing: "-0.02em" }}>Identity <span className="text-shimmer">Vault</span></h2>
              </div>
              <div className="mono-data" style={{ fontSize: 12, color: "var(--t3)" }}>
                 SYNCHRONIZED WITH GENESIS_SEQUENCE @ {new Date().toLocaleTimeString()}
              </div>
           </div>

            <div style={{ display: "flex", gap: "var(--gap)", flexWrap: "wrap", marginBottom: 32 }}>
              <BentoStat label="TOTAL ANCHORED" value={loading ? "..." : stats.total} icon={Database} color="var(--neon-blue)" delay={0.1} />
              <BentoStat label="VALID RECOGNITION" value={loading ? "..." : stats.valid} icon={Zap} color="var(--neon-emerald)" delay={0.2} />
              <BentoStat label="CEASED / REVOKED" value={loading ? "..." : stats.revoked} icon={XCircle} color="var(--neon-red)" delay={0.3} />
               <div className="bento-card" style={{ padding: 32, flex: 1.5, minWidth: 300, display: "flex", flexDirection: "column", gap: 12, background: "rgba(0,0,0,0.4)" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   <Activity size={14} style={{ color: "var(--neon-amber)" }} />
                   <span className="terminal-header" style={{ fontSize: 9, color: "var(--t3)" }}>LOAD_BALANCER</span>
                 </div>
                 <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["STABLE", "IMMUTABLE", "CONSENSUS_REACHED"].map(t => (
                      <div key={t} style={{ fontSize: 9, color: "var(--neon-cyan)", border: "1px solid var(--neon-cyan)33", padding: "4px 8px", background: "var(--neon-cyan)08" }}>{t}</div>
                    ))}
                 </div>
                 <div style={{ height: 2, background: "var(--surface-3)", borderRadius: 0, position: "relative", overflow: "hidden" }}>
                    <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 4, repeat: Infinity }} style={{ width: "20%", height: "100%", background: "var(--neon-amber)" }} />
                 </div>
              </div>
           </div>
        </header>

        {/* ── SEARCH & FILTER ── */}
        <section style={{ marginBottom: 32, display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
           <div className="bento-card" style={{ padding: 8, display: "flex", alignItems: "center" }}>
              <Search size={18} style={{ margin: "0 16px", color: "var(--t3)" }} />
              <input 
                type="text" 
                placeholder="ID_QUERY: KEYWORD / HASH / ISSUER..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, height: 44, background: "transparent", border: "none", color: "var(--t1)", fontSize: 13, outline: "none", fontFamily: "var(--font-mono)" }}
              />
           </div>
           <div className="bento-card" style={{ padding: 4, display: "flex", gap: 4 }}>
              {(["all", "valid", "revoked"] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ 
                    height: 48, padding: "0 20px", background: filter === f ? "var(--neon-cyan)" : "transparent",
                    border: "none",
                    color: filter === f ? "var(--bg)" : "var(--t2)",
                    fontSize: 10, fontWeight: 800, cursor: "pointer", borderRadius: 0, transition: "all .2s",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.1em"
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
           </div>
        </section>

        {/* ── GRID ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "var(--gap)" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 200, background: "var(--surface-1)", border: "1px solid var(--border-subtle)", borderRadius: 0, position: "relative", overflow: "hidden" }}>
                 <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }} />
              </div>
            ))}
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="bento-card" style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <FileText size={48} style={{ color: "var(--surface-3)" }} />
            <div>
              <p className="terminal-header" style={{ fontSize: 13, color: "var(--t3)" }}>No Matches Found</p>
              <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>QUERY RETURNED NULL SET</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
             <AnimatePresence>
               {filteredCerts.map((c, i) => (
                 <motion.div 
                   key={c.hash}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: i * 0.03 }}
                   className="bento-card"
                   style={{ 
                     display: "flex", flexDirection: "column", gap: 20, padding: 0,
                     borderColor: c.isValid ? "var(--border-subtle)" : "rgba(255,0,0,0.2)"
                   }}
                 >
                    <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ width: 44, height: 44, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={20} style={{ color: c.isValid ? "var(--neon-emerald)" : "var(--neon-red)" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                             <IssuerReputation issuerAddress={c.issuer} small />
                             {!c.isValid && (
                               <div style={{ fontSize: 8, fontWeight: 900, color: "var(--neon-red)", border: "1px solid var(--neon-red)33", padding: "2px 6px", letterSpacing: "0.1em" }}>TERMINATED</div>
                             )}
                          </div>
                       </div>

                       <div>
                          <h4 className="terminal-header" style={{ fontSize: 18, color: "var(--t1)", marginBottom: 4 }}>{c.name}</h4>
                          <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5, height: 36, overflow: "hidden" }}>{c.title}</p>
                       </div>

                       <div className="mono-data" style={{ padding: 12, background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)", fontSize: 10 }}>
                          <div style={{ color: "var(--t3)", fontSize: 8, marginBottom: 4 }}>ISSUER_ENDPOINT</div>
                          <div style={{ color: "var(--neon-blue)" }}>{c.issuer.slice(0, 16)}...{c.issuer.slice(-12)}</div>
                       </div>
                    </div>

                    <div className="mono-data" style={{ padding: "12px 24px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: 10, color: "var(--t3)" }}>{new Date(c.timestamp * 1000).toLocaleDateString()}</span>
                       <div style={{ display: "flex", gap: 16 }}>
                          {c.cid && (
                            <a href={`https://gateway.pinata.cloud/ipfs/${c.cid}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--t3)" }}>
                              <ArrowUpRight size={14} />
                            </a>
                          )}
                          <a href={`/?hash=${c.hash}`} style={{ color: "var(--neon-cyan)" }}>
                            <Shield size={14} />
                          </a>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
