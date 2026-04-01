"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Upload, X, Activity, CheckCircle2, Copy, Check, FileText, Terminal, Fingerprint } from "lucide-react";
import { computeFileHash } from "@/lib/blockchain";
import { performVirusTotalScan, pollVirusTotalStatus } from "@/lib/fileScan";

interface Props { onScanComplete?: (file: File, hash: string) => void; onReset?: () => void; }

export default function FileScanUploader({ onScanComplete, onReset }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "scanning" | "safe" | "unsafe" | "error">("idle");
    const [logs, setLogs] = useState<{ msg: string; type: "info" | "ok" | "err" | "warn" }[]>([]);
    const [hash, setHash] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const log = (msg: string, type: "info" | "ok" | "err" | "warn" = "info") =>
        setLogs(prev => [...prev, { msg, type }]);

    const reset = () => { setFile(null); setStatus("idle"); setLogs([]); setHash(null); onReset?.(); };

    const run = async (f: File) => {
        setFile(f); setStatus("scanning");
        setLogs([{ msg: `Loaded: ${f.name}`, type: "info" }]);
        try {
            log("Computing Keccak-256 fingerprint...", "info");
            const h = await computeFileHash(f);
            setHash(h);
            log(`Hash: ${h.slice(0, 12)}...${h.slice(-6)}`, "info");
            log("Submitting to VirusTotal (90+ engines)...", "warn");
            const { analysisId, sha256 } = await performVirusTotalScan(f);
            log("Polling consensus results...", "info");
            const vt = await pollVirusTotalStatus(analysisId || sha256);
            if (!vt.isSafe || vt.status === "malicious") {
                setStatus("unsafe"); log("THREAT DETECTED — blocked", "err");
            } else {
                setStatus("safe"); log("All clear — payload approved", "ok");
                onScanComplete?.(f, h);
            }
        } catch (err: any) {
            setStatus("error"); log(`Error: ${err.message || "Scan failed"}`, "err");
        }
    };

    const logColor = { info: "var(--t3)", ok: "#10b981", err: "#f43f5e", warn: "#f59e0b" };
    const logDot   = { info: "›", ok: "✓", err: "✗", warn: "⚡" };

    const accent = status === "safe" ? "rgba(16,185,129" : status === "unsafe" || status === "error" ? "rgba(244,63,94" : null;

    return (
        <div style={{ width: "100%" }}>
            <AnimatePresence mode="wait">

                {/* ── Idle: Drop zone ── */}
                {status === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && run(e.dataTransfer.files[0]); }}
                            onClick={() => fileRef.current?.click()}
                            style={{
                                position: "relative", height: 160, cursor: "pointer", overflow: "hidden",
                                background: dragOver ? "rgba(16,185,129,0.05)" : "rgba(0,0,0,0.3)",
                                border: `1px ${dragOver ? "solid" : "dashed"} ${dragOver ? "var(--neon-emerald)" : "var(--border-subtle)"}`,
                                borderRadius: 0,
                                transition: "all 0.2s ease",
                            }}
                        >
                            {/* Sweep animation */}
                            <div style={{
                                position: "absolute", left: 0, right: 0, height: 1.5, top: 0,
                                background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.45), transparent)",
                                animation: "sweep-line 2.5s ease-in-out infinite",
                                pointerEvents: "none",
                            }} />

                            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && run(e.target.files[0])} />

                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 0,
                                    background: "var(--surface-3)",
                                    border: "1px solid var(--neon-emerald)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 0 15px var(--neon-emerald)33"
                                }}>
                                    <Fingerprint size={20} style={{ color: "var(--neon-emerald)" }} />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <p className="terminal-header" style={{ fontSize: 13, color: "var(--t1)", letterSpacing: "0.1em" }}>
                                        {dragOver ? "RELEASE_PAYLOAD" : "INGEST_NODE_AWAITING_DATA"}
                                        <span style={{ animation: "blink 1s step-end infinite", opacity: 0.8 }}>_</span>
                                    </p>
                                    <p style={{ fontSize: 9, color: "var(--t3)", marginTop: 6, fontFamily: "var(--font-mono)" }}>PROTO: SHA-256 // CRYPTOGRAPHIC_CLEARENCE_REQUIRED</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Active / result ── */}
                {status !== "idle" && (
                    <motion.div key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            border: `1px solid ${accent ? `${accent},0.25)` : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 4, overflow: "hidden",
                            background: accent ? `${accent},0.04)` : "rgba(255,255,255,0.02)",
                            transition: "all 0.3s ease",
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom: `1px solid ${accent ? `${accent},0.12)` : "rgba(255,255,255,0.05)"}`,
                            background: "rgba(0,0,0,0.1)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                {status === "scanning" && <Activity size={14} style={{ color: "#f59e0b" }} />}
                                {status === "safe"     && <ShieldCheck size={14} style={{ color: "#10b981" }} />}
                                {(status === "unsafe" || status === "error") && <ShieldAlert size={14} style={{ color: "#f43f5e" }} />}
                                <span style={{ fontSize: 13, fontWeight: 600, color: status === "scanning" ? "#f59e0b" : status === "safe" ? "#10b981" : "#f43f5e" }}>
                                    {status === "scanning" ? "Scanning..." : status === "safe" ? "Scan Passed" : status === "unsafe" ? "Threat Detected" : "Scan Error"}
                                </span>
                            </div>
                            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", lineHeight: 0, transition: "color 0.15s" }}
                                onMouseOver={(e) => (e.currentTarget.style.color = "var(--t1)")}
                                onMouseOut={(e) => (e.currentTarget.style.color = "var(--t3)")}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                            {/* File row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <FileText size={13} style={{ color: "var(--t3)", flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{file?.name}</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--t3)", flexShrink: 0 }}>{file ? `${(file.size / 1024).toFixed(0)} KB` : ""}</span>
                            </div>

                            {/* Hash row */}
                            <AnimatePresence>
                                {hash && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 0, maxWidth: "100%", overflow: "hidden" }}
                                    >
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#60a5fa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 10 }}>
                                            {hash.slice(0, 20)}...{hash.slice(-8)}
                                        </span>
                                        <button onClick={() => { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10b981" : "var(--t3)", flexShrink: 0, lineHeight: 0, transition: "color 0.15s" }}>
                                            {copied ? <Check size={13} /> : <Copy size={13} />}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Terminal */}
                            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)", borderRadius: 0, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
                                    <div style={{ display: "flex", gap: 5 }}>
                                        {["var(--neon-red)", "var(--neon-amber)", "var(--neon-emerald)"].map((c) => (
                                            <div key={c} style={{ width: 6, height: 6, background: c, opacity: 0.8 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)", marginLeft: 4 }}>audit.log</span>
                                </div>
                                <div style={{ padding: "10px 14px", minHeight: 64, maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                                    {logs.map((entry, i) => (
                                        <div key={i} style={{ display: "flex", gap: 8 }}>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: logColor[entry.type], flexShrink: 0 }}>{logDot[entry.type]}</span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: logColor[entry.type] }}>{entry.msg}</span>
                                        </div>
                                    ))}
                                    {status === "scanning" && (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#f59e0b" }}>›</span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#f59e0b", animation: "ping 1.2s ease infinite" }}>Waiting for consensus...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Approval */}
                            <AnimatePresence>
                                {status === "safe" && (
                                    <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}
                                    >
                                        <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>Approved for on-chain issuance</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
