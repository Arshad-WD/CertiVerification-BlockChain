"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  ShieldCheck, ShieldX, Hash, Copy, Check, Upload, Zap, Lock, 
  Activity, Loader2, Calendar, User, Server, ArrowRight, FileCheck2,
  Database, Globe, Clock, Fingerprint, BarChart3, AlertCircle, Terminal
} from "lucide-react";
import { computeFileHash, verifyCertificateHash, getContract } from "@/lib/blockchain";
import IssuerReputation from "@/components/IssuerReputation";
import CertificateQR from "@/components/CertificateQR";
import CertificateTimeline from "@/components/CertificateTimeline";
import { ethers } from "ethers";

/* ── Components ────────────────────────── */

const BentoBox = ({ children, title, icon: Icon, className = "", delay = 0 }: any) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bento-card ${className}`}
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--t3)" }}>
        <Icon size={14} style={{ color: "var(--neon-cyan)" }} />
        <span className="terminal-header" style={{ fontSize: 10 }}>{title}</span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </motion.div>
  );
};

const StatItem = ({ label, value, sub, icon: Icon, color = "var(--neon-cyan)" }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ 
      width: 40, height: 40, borderRadius: 2, background: "rgba(0,0,0,0.3)", 
      border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" 
    }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <div className="mono-data" style={{ fontSize: 18, fontWeight: 700, color: "var(--t1)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  </div>
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setResult(null); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); };

  const verify = async () => {
    setLoading(true); setResult(null); setElapsed(0); setSealed(false);
    const t0 = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    try {
      let hash = certId.trim();
      if (file) hash = await computeFileHash(file);
      if (!hash) { setLoading(false); clearInterval(timer); return; }
      const res = await verifyCertificateHash(hash);
      setResult({ ...res, hash });
    } catch { setResult({ error: true }); }
    clearInterval(timer); setLoading(false);
  };

  const sealVerification = async () => {
    if (!result?.hash || !window.ethereum) return;
    setSealing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.recordVerification(result.hash);
      await tx.wait();
      setSealed(true);
    } catch (err) { console.error("Seal Error:", err); }
    setSealing(false);
  };

  const state = loading ? "loading" : result?.exists && result?.valid ? "valid" : result ? "invalid" : "idle";

  return (
    <div className="cyber-overlay">
      <div className="scanline" />
      <Navbar />

      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", paddingTop: "120px", paddingBottom: "120px", paddingLeft: "32px", paddingRight: "32px" }}>
        
        {/* ── STACKED HEADER ── */}
        <section style={{ marginBottom: "var(--section-spacing)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "end" }}>
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <span className="terminal-header" style={{ color: "var(--neon-cyan)", fontSize: 12, marginBottom: 16, display: "block" }}>
                  System Identity // Operational
                </span>
                <h1 className="terminal-header" style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 0.9, marginBottom: 24 }}>
                  Protocol<br /><span className="text-shimmer">Verification</span>
                </h1>
                <p style={{ color: "var(--t2)", fontSize: 16, maxWidth: 460, lineHeight: 1.6 }}>
                  Cryptographic attestation and security clearing for digital academic assets. 
                  Leveraging cross-chain consensus for absolute validity.
                </p>
              </motion.div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}>
               <BentoBox title="Status" icon={Activity} className="animate-flicker">
                 <StatItem label="Node" value="Active" icon={Globe} color="var(--neon-emerald)" />
               </BentoBox>
               <BentoBox title="Load" icon={BarChart3}>
                 <StatItem label="Block" value="#492-1" icon={Database} color="var(--neon-blue)" />
               </BentoBox>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ACTION ── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(100px, auto)", gap: "var(--gap)" }}>
          
          {/* UPLOADER / INPUT */}
          <motion.div 
            style={{ gridColumn: "span 7", gridRow: "span 4" }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bento-card" style={{ height: "100%", padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   <Fingerprint size={16} style={{ color: "var(--neon-cyan)" }} />
                   <span className="terminal-header" style={{ fontSize: 12 }}>Ingest Node</span>
                 </div>
                 {file && (
                   <button onClick={() => setFile(null)} style={{ border: "none", background: "none", color: "var(--neon-red)", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                     RESET INTERFACE
                   </button>
                 )}
               </div>

               <div 
                 onDragOver={e => { e.preventDefault(); setDragOver(true); }} 
                 onDragLeave={() => setDragOver(false)}
                 onDrop={handleDrop} 
                 onClick={() => fileRef.current?.click()}
                 style={{ 
                   flex: 1, minHeight: 240, border: `1px ${dragOver ? "solid" : "dashed"} ${dragOver ? "var(--neon-cyan)" : "var(--border-subtle)"}`,
                   background: "rgba(0,0,0,0.3)", borderRadius: 0, display: "flex", flexDirection: "column",
                   alignItems: "center", justifyContent: "center", gap: 16, cursor: "pointer", position: "relative",
                   overflow: "hidden"
                 }}
               >
                  {state === "loading" && <div style={{ position: "absolute", inset: 0, background: "var(--neon-cyan)", boxShadow: "0 0 15px var(--neon-cyan)", height: 1, top: 0, animation: "scan-sweep 2s linear infinite", opacity: 0.2 }} />}
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
                        <div style={{ width: 60, height: 60, background: "var(--surface-3)", border: "1px solid var(--neon-cyan)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                          <FileCheck2 size={28} style={{ color: "var(--neon-cyan)" }} />
                        </div>
                        <p className="mono-data" style={{ fontSize: 14 }}>{file.name}</p>
                        <p style={{ fontSize: 11, color: "var(--t3)" }}>LOADED INTO BUFFER</p>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
                        <Terminal size={32} style={{ color: "var(--neon-cyan)", marginBottom: 16, opacity: 0.5 }} />
                        <p className="terminal-header" style={{ fontSize: 13, color: "var(--t2)", letterSpacing: "0.1em" }}>
                          {dragOver ? "RELEASE_PAYLOAD" : "INGEST_NODE_AWAITING_DATA"}
                          <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
                        </p>
                        <p style={{ fontSize: 9, color: "var(--t3)", marginTop: 6, fontFamily: "var(--font-mono)" }}>SUPPORTED: PDF, DOCX, BIN // AUTO_SCAN: ENABLED</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
               </div>

               <div style={{ display: "flex", gap: 12 }}>
                 <div style={{ position: "relative", flex: 1 }}>
                   <Hash size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }} />
                   <input 
                     type="text" value={certId} onChange={e => setCertId(e.target.value)}
                     placeholder="INPUT_HASH_OR_KEY: 0x..."
                     style={{ width: "100%", height: 52, background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 0, paddingLeft: 48, fontSize: 13, color: "var(--t1)", fontFamily: "var(--font-mono)", outline: "none" }}
                   />
                 </div>
                 <button onClick={verify} disabled={loading || (!file && !certId)} className="btn-cyber" style={{ width: 140 }}>
                   {loading ? <Loader2 size={18} className="animate-spin" /> : "EXECUTE"}
                 </button>
               </div>
            </div>
          </motion.div>

          {/* STATUS / RESULT */}
          <motion.div 
            style={{ gridColumn: "span 5", gridRow: "span 4" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bento-card" style={{ height: "100%", padding: 32, display: "flex", flexDirection: "column" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--t3)", marginBottom: 24 }}>
                 <Clock size={14} style={{ color: result ? (result.valid ? "var(--neon-emerald)" : "var(--neon-red)") : "var(--neon-amber)" }} />
                 <span className="terminal-header" style={{ fontSize: 10 }}>Runtime Output</span>
               </div>

               <div style={{ flex: 1 }}>
                 <AnimatePresence mode="wait">
                   {state === "idle" && (
                     <motion.div key="idle" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 }}>
                        <AlertCircle size={40} style={{ color: "var(--surface-3)" }} />
                        <div>
                          <p className="terminal-header" style={{ fontSize: 13, color: "var(--t3)" }}>Idle State</p>
                          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>AWAITING PROTOCOL TRIGGER</p>
                        </div>
                     </motion.div>
                   )}

                   {state === "loading" && (
                     <motion.div key="loading" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                           <div style={{ position: "relative", width: 120, height: 120, border: "2px solid var(--surface-2)", borderRadius: 0, padding: 10 }}>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTopColor: "var(--neon-cyan)", borderRadius: 0 }} />
                              <div style={{ height: "100%", width: "100%", background: "var(--surface-2)", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Activity size={32} style={{ color: "var(--neon-cyan)" }} />
                              </div>
                           </div>
                        </div>
                        <div className="mono-data" style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", fontSize: 11 }}>
                           <p style={{ color: "var(--neon-cyan)" }}>› ESTABLISHING NODE LINK...</p>
                           <p style={{ color: "var(--neon-cyan)", marginTop: 4 }}>› BUFFERING CERTIFICATE DATA...</p>
                           <p style={{ color: "var(--neon-amber)", marginTop: 4 }}>› PINGING REPUTATION ENGINE: {elapsed}s</p>
                        </div>
                     </motion.div>
                   )}

                   {state === "valid" && (
                     <motion.div key="valid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ padding: 16, background: "rgba(0,255,180,0.05)", border: "1px solid var(--neon-emerald)", display: "flex", alignItems: "center", gap: 12 }}>
                           <ShieldCheck size={20} style={{ color: "var(--neon-emerald)" }} />
                           <span className="terminal-header" style={{ fontSize: 14, color: "var(--neon-emerald)" }}>Identity Cleared</span>
                        </div>

                        <div className="mono-data" style={{ fontSize: 11, color: "var(--t2)", display: "flex", flexDirection: "column", gap: 10 }}>
                           <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-dim)", paddingBottom: 8 }}>
                             <span>ISSUER CID</span>
                             <span style={{ color: "var(--neon-blue)" }}>{result.issuer.slice(0, 16)}...</span>
                           </div>
                           <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-dim)", paddingBottom: 8 }}>
                             <span>ISSUED ON</span>
                             <span style={{ color: "var(--neon-blue)" }}>{new Date(Number(result.timestamp)*1000).toLocaleDateString()}</span>
                           </div>
                           <div style={{ display: "flex", justifyContent: "space-between" }}>
                             <span>REPUTATION</span>
                             <IssuerReputation issuerAddress={result.issuer} small />
                           </div>
                        </div>

                        <div style={{ padding: 12, background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)" }}>
                           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                             <span style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--font-mono)" }}>HASH_SIG</span>
                             <Copy size={10} style={{ color: "var(--t3)", cursor: "pointer" }} onClick={() => { navigator.clipboard.writeText(result.hash); setCopied(true); setTimeout(()=>setCopied(false),2000); }} />
                           </div>
                           <p className="mono-data" style={{ fontSize: 10, color: "var(--neon-blue)", wordBreak: "break-all" }}>{result.hash}</p>
                        </div>

                        <button onClick={sealVerification} disabled={sealing || sealed} className="btn-cyber" style={{ width: "100%", height: 38, border: `1px solid ${sealed ? "var(--neon-emerald)" : "var(--neon-cyan)"}`, color: sealed ? "var(--neon-emerald)" : "var(--neon-cyan)" }}>
                           {sealing ? <Loader2 size={14} className="animate-spin" /> : sealed ? "SEALED ON LEDGER" : "PERSONALLY SEAL"}
                        </button>
                     </motion.div>
                   )}

                   {state === "invalid" && (
                     <motion.div key="invalid" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 0, border: "2px solid var(--neon-red)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,0,0,0.05)" }}>
                           <ShieldX size={30} style={{ color: "var(--neon-red)" }} />
                        </div>
                        <div>
                          <p className="terminal-header" style={{ fontSize: 16, color: "var(--neon-red)" }}>Hash Mismatch</p>
                          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>No valid record on Genesis sequence.</p>
                        </div>
                        <button onClick={() => setResult(null)} style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-2)", color: "var(--t2)", padding: "8px 20px", cursor: "pointer", fontSize: 11 }}>RETRY SCAN</button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          </motion.div>

          {/* BOTTOM BENTOS - Rep & QR */}
          {state === "valid" && (
            <>
              <motion.div style={{ gridColumn: "span 4", gridRow: "span 2" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bento-card" style={{ padding: 24, height: "100%" }}>
                   <IssuerReputation issuerAddress={result.issuer} />
                </div>
              </motion.div>
              <motion.div style={{ gridColumn: "span 4", gridRow: "span 2" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bento-card" style={{ padding: 24, height: "100%" }}>
                   <CertificateQR hash={result.hash} />
                </div>
              </motion.div>
              <motion.div style={{ gridColumn: "span 4", gridRow: "span 2" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bento-card" style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}>
                   <Globe size={24} style={{ color: "var(--surface-3)" }} />
                   <p className="terminal-header" style={{ fontSize: 9, color: "var(--t3)" }}>Cross-Chain Mirroring</p>
                   <div style={{ width: "100%", height: 4, background: "var(--surface-2)", borderRadius: 0, overflow: "hidden" }}>
                     <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "40%", height: "100%", background: "var(--neon-blue)" }} />
                   </div>
                </div>
              </motion.div>
            </>
          )}

        </section>

        {/* TIMELINE SECTION */}
        <AnimatePresence>
          {state === "valid" && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              style={{ marginTop: 80 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
                <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, var(--border-subtle))" }} />
                <h3 className="terminal-header" style={{ fontSize: 20, color: "var(--t1)" }}>Audit_Sequence</h3>
                <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, var(--border-subtle), transparent)" }} />
              </div>
              <CertificateTimeline hash={result.hash} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @keyframes scan-sweep { 0% { top: -2px; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
