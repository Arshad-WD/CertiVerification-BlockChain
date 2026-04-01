"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
    ShieldCheck, Loader2, Hash, Plus, CheckCircle2,
    AlertTriangle, FileText, ArrowUpRight, Shield,
    Activity, Database, Terminal, UserPlus, History,
    Fingerprint, Cpu, Globe
} from "lucide-react";
import { getContract, getIssuerRole, getPublicContract } from "@/lib/blockchain";
import { uploadToIPFS } from "@/lib/ipfs";
import FileScanUploader from "@/components/FileScanUploader";
import CertificateQR from "@/components/CertificateQR";

export default function IssuerDashboard() {
    const [account, setAccount] = useState<string | null>(null);
    const [isIssuer, setIsIssuer] = useState<boolean | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [computedHash, setComputedHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [issuedCerts, setIssuedCerts] = useState<any[]>([]);
    const [txSuccess, setTxSuccess] = useState<string | null>(null);
    const [studentName, setStudentName] = useState("");
    const [certTitle, setCertTitle] = useState("");
    const [lastIssuedHash, setLastIssuedHash] = useState<string | null>(null);

    useEffect(() => { checkIssuerStatus(); loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            const contract = getPublicContract();
            const filter = contract.filters.CertificateIssued();
            const events = (await contract.queryFilter(filter)) as ethers.EventLog[];
            const history = events.map((ev: any) => {
                const a = ev.args;
                return {
                    name:  a?.name  || "N/A",
                    title: a?.title || "N/A",
                    hash:  a?.hash,
                    cid:   a?.cid   || "",
                    date:  a?.timestamp ? new Date(Number(a.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
                    tx:    ev.transactionHash,
                };
            }).reverse();
            setIssuedCerts(history);
        } catch (err) { console.error("loadHistory:", err); }
    };

    const checkIssuerStatus = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                    const status = await getIssuerRole(accounts[0].address, provider);
                    setIsIssuer(status);
                }
            } catch (err) { console.error("checkIssuerStatus:", err); }
        }
    };

    const handleIssue = async () => {
        if (!file || !computedHash || !studentName || !certTitle) return;
        setLoading(true); setTxSuccess(null); setLastIssuedHash(null);
        setUploadStatus("UPLOADING_PAYLOAD...");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const signer = await provider.getSigner();
            const contract = getContract(signer);
            const ipfsResult = await uploadToIPFS(file);
            if (!ipfsResult.success) throw new Error("IPFS_REJECTED");
            setUploadStatus("BROADCASTING_TX...");
            const tx = await contract.issueCertificate(computedHash, String(studentName), String(certTitle), String(ipfsResult.cid));
            setUploadStatus("AWAITING_CONSENSUS...");
            await tx.wait();
            setTxSuccess(tx.hash);
            setLastIssuedHash(computedHash);
            setUploadStatus("");
            loadHistory();
            setTimeout(() => { 
              setFile(null); setComputedHash(null); setStudentName(""); setCertTitle(""); setTxSuccess(null); setLastIssuedHash(null); 
            }, 60000); // 60 seconds
        } catch (err: any) {
            console.error(err);
            alert(err.reason || "Transaction failed.");
            setUploadStatus("");
        }
        setLoading(false);
    };

    const canSubmit = !!(file && computedHash && studentName && certTitle && !loading && isIssuer !== false);

    return (
        <div className="cyber-overlay">
            <div className="scanline" />
            <Navbar />

            <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", paddingTop: "120px", paddingBottom: "120px", paddingLeft: "32px", paddingRight: "32px" }}>
                
                {/* ── HEADER ── */}
                <header style={{ marginBottom: "var(--section-spacing)" }}>
                   <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
                      <div>
                         <span className="terminal-header" style={{ color: "var(--neon-emerald)", fontSize: 11, display: "block", marginBottom: 12 }}>Authorized Node // Issuer Interface</span>
                         <h2 className="terminal-header" style={{ fontSize: 40, letterSpacing: "-0.02em" }}>Command <span className="text-shimmer">Center</span></h2>
                      </div>
                      <div className="mono-data" style={{ fontSize: 12, color: "var(--t3)" }}>
                         SESSION_ID: {account ? account.slice(0, 16) : "UNAUTHORIZED"}
                      </div>
                   </div>

                    <div style={{ display: "flex", gap: "var(--gap)", flexWrap: "wrap", marginBottom: "var(--gap)" }}>
                      <div className="bento-card" style={{ padding: 32, flex: 1, minWidth: 260 }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <Cpu size={16} style={{ color: "var(--neon-emerald)" }} />
                            <span className="terminal-header" style={{ fontSize: 9, color: "var(--t3)" }}>AUTH_STATUS</span>
                         </div>
                         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                             <div className="status-dot" style={{ background: isIssuer ? "var(--neon-emerald)" : "var(--neon-red)", borderRadius: 0 }} />
                            <span className="mono-data" style={{ fontSize: 18, color: "var(--t1)" }}>{isIssuer ? "CLEARANCE_GRANTED" : "ACCESS_DENIED"}</span>
                         </div>
                      </div>
                      <div className="bento-card" style={{ padding: 32, flex: 1, minWidth: 260 }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <History size={16} style={{ color: "var(--neon-blue)" }} />
                            <span className="terminal-header" style={{ fontSize: 9, color: "var(--t3)" }}>LIFETIME_ISSUANCE</span>
                         </div>
                         <div className="mono-data" style={{ fontSize: 24, fontWeight: 800, color: "var(--t1)" }}>{issuedCerts.length} UNIT(S)</div>
                      </div>
                      <div className="bento-card" style={{ padding: 32, flex: 1.5, minWidth: 320, display: "flex", alignItems: "center", gap: 20, background: "rgba(0,0,0,0.4)" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 0, border: "1px solid var(--neon-emerald)33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Globe size={22} style={{ color: "var(--neon-emerald)" }} />
                          </div>
                          <div>
                             <p className="terminal-header" style={{ fontSize: 10, color: "var(--t1)" }}>Mainnet Propagation</p>
                             <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>GLOBAL_LATENCY: 1.2ms</p>
                          </div>
                      </div>
                   </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }}>
                    
                    {/* ── LEFT: FORM ── */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <AnimatePresence>
                            {isIssuer === false && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 20 }}>
                                    <div style={{ padding: 20, background: "rgba(255,0,0,0.05)", border: "1px solid var(--neon-red)", display: "flex", gap: 16 }}>
                                       <AlertTriangle size={20} style={{ color: "var(--neon-red)" }} />
                                       <div>
                                          <p className="terminal-header" style={{ fontSize: 14, color: "var(--neon-red)" }}>Access Violation</p>
                                          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>This identity key does not hold sufficient privileges for GenSeq_Issuance.</p>
                                       </div>
                                    </div>
                                </motion.div>
                            )}
                            {txSuccess && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 20 }}>
                                    <div style={{ padding: 20, background: "rgba(0,255,180,0.05)", border: "1px solid var(--neon-emerald)", display: "flex", gap: 16 }}>
                                       <CheckCircle2 size={24} style={{ color: "var(--neon-emerald)" }} />
                                       <div style={{ flex: 1 }}>
                                          <p className="terminal-header" style={{ fontSize: 14, color: "var(--neon-emerald)" }}>Issuance Successful</p>
                                          <p className="mono-data" style={{ fontSize: 10, color: "var(--t3)", marginTop: 4, wordBreak: "break-all" }}>TX_HASH: {txSuccess}</p>
                                       </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="bento-card" style={{ padding: 40 }}>
                             <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                               <div style={{ width: 32, height: 32, background: "var(--surface-3)", border: "1px solid var(--neon-emerald)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <UserPlus size={16} style={{ color: "var(--neon-emerald)" }} />
                               </div>
                               <span className="terminal-header" style={{ fontSize: 14 }}>Draft_Entry</span>
                             </div>

                             <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <AnimatePresence>
                                    {lastIssuedHash && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 40 }}>
                                            <div style={{ padding: 24, border: "1px solid var(--neon-emerald)33", background: "rgba(0,0,0,0.2)" }}>
                                               <CertificateQR hash={lastIssuedHash} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 40 }}>
                                   <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                      <div>
                                          <label className="terminal-header" style={{ fontSize: 9, color: "var(--t3)", marginBottom: 8, display: "block" }}>Subject Name</label>
                                          <input 
                                            className="inp" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} 
                                            placeholder="GIVEN_NAME"                                             style={{ height: 48, background: "var(--surface-2)", border: "1px solid var(--border-subtle)", padding: "0 16px", borderRadius: 0 }} 
                                          />
                                      </div>
                                      <div>
                                          <label className="terminal-header" style={{ fontSize: 9, color: "var(--t3)", marginBottom: 8, display: "block" }}>Credential Title</label>
                                          <input 
                                            className="inp" type="text" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} 
                                            placeholder="PROGRAM_KEY"
                                            style={{ height: 48, background: "var(--surface-2)", border: "1px solid var(--border-subtle)", padding: "0 16px", borderRadius: 2 }} 
                                          />
                                      </div>
                                   </div>
                                   <div className="bento-card" style={{ padding: 20, background: "rgba(0,0,0,0.2)", borderStyle: "dashed" }}>
                                       <FileScanUploader
                                            onScanComplete={(f, h) => { setFile(f); setComputedHash(h); }}
                                            onReset={() => { setFile(null); setComputedHash(null); }}
                                        />
                                   </div>
                                </div>

                                <AnimatePresence>
                                    {computedHash && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mono-data" style={{ padding: 16, background: "rgba(0,255,180,0.03)", border: "1px solid var(--neon-emerald)33" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <Fingerprint size={12} style={{ color: "var(--neon-emerald)" }} />
                                                <span style={{ fontSize: 8, color: "var(--t3)" }}>SECURE_FINGERPRINT</span>
                                            </div>
                                            <p style={{ fontSize: 11, color: "var(--neon-emerald)", wordBreak: "break-all" }}>{computedHash}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button onClick={handleIssue} disabled={!canSubmit} className="btn-cyber" style={{ height: 56, width: "100%", border: `1px solid ${canSubmit ? "var(--neon-emerald)" : "var(--border-subtle)"}`, color: canSubmit ? "var(--neon-emerald)" : "var(--t3)" }}>
                                    {loading ? <><Loader2 size={20} className="animate-spin" /> {uploadStatus}</> : <><ShieldCheck size={20} /> AUTHORIZE_ISSUANCE</>}
                                </button>
                             </div>
                        </div>
                    </motion.div>

                    {/* ── RIGHT: HISTORY ── */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                           <span className="terminal-header" style={{ fontSize: 13, color: "var(--t2)" }}>Audit_Log</span>
                           <Terminal size={14} style={{ color: "var(--t3)" }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                           {issuedCerts.length === 0 ? (
                               <div className="bento-card" style={{ padding: 48, textAlign: "center", borderStyle: "dashed", opacity: 0.5 }}>
                                  <Database size={32} style={{ margin: "0 auto 16px", color: "var(--surface-3)" }} />
                                  <p className="terminal-header" style={{ fontSize: 10, color: "var(--t3)" }}>No Entries Recorded</p>
                               </div>
                           ) : (
                               issuedCerts.slice(0, 8).map((cert, i) => (
                                   <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bento-card" style={{ padding: 16 }}>
                                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                          <div>
                                             <p className="terminal-header" style={{ fontSize: 12, color: "var(--t1)" }}>{cert.name}</p>
                                             <p style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{cert.title}</p>
                                          </div>
                                          {cert.cid && (
                                              <a href={`https://gateway.pinata.cloud/ipfs/${cert.cid}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--t3)" }}>
                                                 <ArrowUpRight size={14} />
                                              </a>
                                          )}
                                       </div>
                                       <div className="mono-data" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, paddingTop: 12, borderTop: "1px solid var(--border-dim)" }}>
                                          <span style={{ color: "var(--t3)" }}>{cert.date}</span>
                                          <span style={{ color: "var(--neon-emerald)" }}>CONFIRMED</span>
                                       </div>
                                   </motion.div>
                               ))
                           )}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
