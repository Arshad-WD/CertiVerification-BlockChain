"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import {
    Plus, FileText, Upload, ShieldCheck, ExternalLink, History,
    Loader2, AlertCircle, Fingerprint, Sparkles, Send, CheckCircle2,
    Zap, LayoutDashboard, Database, Activity, User, ChevronRight, LogOut, Lock
} from "lucide-react";
import { computeFileHash, getContract, getIssuerRole } from "@/lib/blockchain";
import { uploadToIPFS } from "@/lib/ipfs";
import { motion, AnimatePresence } from "framer-motion";

export default function IssuerDashboard() {
    const [activeTab, setActiveTab] = useState("issue");
    const [account, setAccount] = useState<string | null>(null);
    const [isIssuer, setIsIssuer] = useState<boolean | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [issuedCerts, setIssuedCerts] = useState<any[]>([]);

    // Form Fields
    const [studentName, setStudentName] = useState("");
    const [certTitle, setCertTitle] = useState("");

    useEffect(() => {
        checkIssuerStatus();
    }, []);

    const checkIssuerStatus = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);

                const status = await getIssuerRole(accounts[0], provider);
                setIsIssuer(status);
            } catch (error) {
                console.error("Error checking issuer status:", error);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleIssue = async () => {
        if (!file || !studentName || !certTitle) return;
        setLoading(true);
        setUploadStatus("Ingesting Asset to IPFS Cluster...");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = await getContract(signer);

            // 1. Upload to IPFS
            const ipfsResult = await uploadToIPFS(file);
            if (!ipfsResult.success) throw new Error("IPFS Propagation Failure");

            // 2. Compute Hash
            const fileHash = await computeFileHash(file);
            setUploadStatus("Finalising Cryptographic Handshake...");

            // 3. Issue on Blockchain
            const tx = await contract.issueCertificate(fileHash);
            setUploadStatus("Syncing with Global Consensus...");
            await tx.wait();

            setUploadStatus("Consensus Achieved. Record Immutable.");
            setFile(null);
            setStudentName("");
            setCertTitle("");

            setIssuedCerts(prev => [{
                name: studentName,
                title: certTitle,
                hash: fileHash,
                cid: ipfsResult.cid,
                date: new Date().toLocaleDateString(),
                tx: tx.hash
            }, ...prev]);

        } catch (error: any) {
            console.error("Issuance failed:", error);
            alert(error.message || "Protocol level failure during issuance");
        }
        setLoading(false);
        setTimeout(() => setUploadStatus(""), 6000);
    };

    if (isIssuer === false) {
        return (
            <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303]">
                <Navbar />
                <main className="pt-48 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-16 glass-card rounded-[4rem] shadow-2xl border-rose-500/10 max-w-lg w-full">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                            <Lock className="w-12 h-12 text-rose-500" />
                        </div>
                        <h1 className="text-4xl font-black mb-6 tracking-tightest">Restricted Protocol</h1>
                        <p className="text-zinc-500 leading-relaxed mb-12 font-medium">Your cryptographic key does not possess signing authority for this institutional partition.</p>
                        <button onClick={() => window.location.href = '/'} className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black tracking-widest text-sm uppercase shadow-xl">Return to Homepage</button>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303] flex">
            <Navbar />

            {/* Sidebar Navigation */}
            <aside className="fixed left-6 top-32 bottom-6 w-80 glass-card rounded-[3.5rem] border-white/40 dark:border-white/5 p-10 flex flex-col hidden lg:flex shadow-2xl z-50">
                <div className="mb-16">
                    <div className="flex items-center gap-3 px-4 mb-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black tracking-tightest">WORKSPACE</h4>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Authorized Issuer</p>
                        </div>
                    </div>

                    <nav className="space-y-4">
                        {[
                            { id: "issue", label: "Issue Record", icon: Plus },
                            { id: "history", label: "Ledger Activity", icon: History },
                            { id: "txs", label: "Transactions", icon: Activity },
                            { id: "profile", label: "Identity Profile", icon: User },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all group ${activeTab === item.id
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl"
                                        : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? "" : "group-hover:text-blue-500"}`} />
                                    <span className="text-sm font-black tracking-tightest">{item.label}</span>
                                </div>
                                {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-40" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto space-y-6">
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Sync Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest uppercase">EVM Main Layer</span>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-4 p-5 rounded-3xl text-rose-500 font-black text-sm hover:bg-rose-500/5 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="tracking-tightest">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Dashboard Area */}
            <main className="flex-1 lg:ml-96 pt-44 pb-32 px-10">
                <div className="max-w-5xl">
                    <header className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-between items-end mb-10"
                        >
                            <div>
                                <h1 className="text-7xl font-black tracking-tightest leading-none mb-4 text-gradient uppercase">Console</h1>
                                <p className="text-zinc-500 font-medium">Commit cryptographic proofs for institutional credentials.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Subject Signature</p>
                                <p className="font-mono text-xs bg-zinc-50 dark:bg-zinc-900 px-5 py-2.5 rounded-2xl border border-zinc-100 dark:border-white/5">{account}</p>
                            </div>
                        </motion.div>
                    </header>

                    <AnimatePresence mode="wait">
                        {activeTab === "issue" && (
                            <motion.div
                                key="issue"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                            >
                                {/* Issuance Form */}
                                <div className="glass-card rounded-[4rem] p-16 shadow-2xl border-white/40 dark:border-white/5">
                                    <h3 className="text-4xl font-black mb-12 tracking-tightest uppercase">Forge Record</h3>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">Recipient Name</label>
                                            <input
                                                type="text"
                                                value={studentName}
                                                onChange={(e) => setStudentName(e.target.value)}
                                                placeholder="Student Full Name"
                                                className="w-full h-20 px-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl outline-none border border-zinc-100 dark:border-white/5 focus:border-blue-500 transition-all font-medium text-lg"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">Certificate Classification</label>
                                            <input
                                                type="text"
                                                value={certTitle}
                                                onChange={(e) => setCertTitle(e.target.value)}
                                                placeholder="e.g. B.Sc Computer Engineering"
                                                className="w-full h-20 px-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl outline-none border border-zinc-100 dark:border-white/5 focus:border-blue-500 transition-all font-medium text-lg"
                                            />
                                        </div>

                                        <div className="space-y-8 pt-6">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleIssue}
                                                disabled={!file || !studentName || !certTitle || loading}
                                                className="w-full h-24 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ShieldCheck className="w-7 h-7" />}
                                                <span>{loading ? "EXECUTING..." : "COMMIT TO CHAIN"}</span>
                                            </motion.button>

                                            {uploadStatus && (
                                                <p className="text-xs text-center font-black text-blue-500 italic uppercase tracking-widest animate-pulse">{uploadStatus}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* File Dropzone */}
                                <div
                                    className={`relative group bg-zinc-50 dark:bg-zinc-950/40 border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-10 transition-all duration-700 ${file ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-zinc-100 dark:border-white/5 hover:border-blue-500/30"
                                        }`}
                                >
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="application/pdf" />
                                    <AnimatePresence mode="wait">
                                        {file ? (
                                            <motion.div key="file" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                                                <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30">
                                                    <FileText className="w-16 h-16 text-white" />
                                                </div>
                                                <h4 className="text-2xl font-black mb-2 tracking-tightest">{file.name}</h4>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Asset Payload Verified</p>
                                                <button onClick={() => setFile(null)} className="mt-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Reset Payload</button>
                                            </motion.div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-zinc-100 dark:border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                                                    <Upload className="w-10 h-10 text-zinc-300" />
                                                </div>
                                                <p className="text-xl font-black tracking-tightest mb-2 px-10 leading-tight">Drop Certificate Asset (PDF)</p>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Max Load 10MB</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "history" && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-[4rem] border-white/40 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden min-h-[600px]"
                            >
                                <div className="p-16 border-b dark:border-white/5 flex justify-between items-center">
                                    <h3 className="text-4xl font-black tracking-tightest uppercase">Emission History</h3>
                                    <div className="flex gap-4">
                                        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-white/5 text-[10px] font-black tracking-widest uppercase">Export Logs</div>
                                    </div>
                                </div>

                                {issuedCerts.length === 0 ? (
                                    <div className="py-40 text-center opacity-40">
                                        <History className="w-20 h-20 mx-auto mb-10 text-zinc-200" />
                                        <p className="text-2xl font-black tracking-tightest uppercase">No Active States</p>
                                    </div>
                                ) : (
                                    <div className="divide-y dark:divide-white/5">
                                        {issuedCerts.map((cert, i) => (
                                            <div key={i} className="p-12 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-10">
                                                    <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-white/5 flex items-center justify-center shadow-lg group-hover:border-blue-500/50 transition-colors">
                                                        <Fingerprint className="w-10 h-10 text-blue-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-3xl font-black tracking-tightest">{cert.name}</h4>
                                                        <p className="text-zinc-500 font-medium">{cert.title}</p>
                                                        <p className="text-[10px] font-mono text-zinc-400 mt-2 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg w-fit border dark:border-white/5">{cert.hash}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <a href={`https://gateway.pinata.cloud/ipfs/${cert.cid}`} target="_blank" className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:text-blue-600 transition-colors shadow-sm">
                                                        <ExternalLink className="w-6 h-6" />
                                                    </a>
                                                    <button className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:text-blue-600 transition-colors shadow-sm">
                                                        <Activity className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
