"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import {
    Plus, FileText, Upload, ShieldCheck, ExternalLink, History,
    Loader2, AlertCircle, Fingerprint, Sparkles, Send, CheckCircle2,
    Zap, LayoutDashboard, Database, Activity, User, ChevronRight, LogOut, Lock,
    Grid, List, Settings, Info, Trash2
} from "lucide-react";
import { computeFileHash, getContract, getIssuerRole, EXPECTED_CHAIN_ID, checkContractSync, getPublicContract } from "@/lib/blockchain";
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
    const [stats, setStats] = useState({ issued: 0, revoked: 0 });

    // Form Fields
    const [studentName, setStudentName] = useState("");
    const [certTitle, setCertTitle] = useState("");

    useEffect(() => {
        checkIssuerStatus();
        loadHistory();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const loadHistory = async () => {
        const syncStatus = await checkContractSync();
        if (syncStatus !== "OK") {
            console.warn("Blockchain sync check failed:", syncStatus);
            return;
        }

        try {
            const contract = getPublicContract();
            const issuedCount = await contract.totalIssued();
            const revokedCount = await contract.totalRevoked();
            setStats({ issued: Number(issuedCount), revoked: Number(revokedCount) });

            const filter = contract.filters.CertificateIssued();
            const events = await contract.queryFilter(filter);
            
            const revokeFilter = contract.filters.CertificateRevoked();
            const revokeEvents = await contract.queryFilter(revokeFilter);
            const revokedHashes = new Set(revokeEvents.map(e => (e as any).args.hash));

            const history = events.map(event => {
                const args = (event as any).args;
                if (!args) return null;
                const hash = args.hash;
                return {
                    name: args.name || "N/A",
                    title: args.title || "N/A",
                    hash: hash,
                    cid: args.cid || "",
                    date: args.timestamp ? new Date(Number(args.timestamp) * 1000).toLocaleDateString() : "N/A",
                    tx: event.transactionHash,
                    isValid: !revokedHashes.has(hash)
                };
            }).filter(Boolean).reverse();

            setIssuedCerts(history as any[]);
        } catch (error: any) {
            console.error("Stable Provider loadHistory failed:", error);
        }
    };

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

    const handleRevoke = async (hash: string) => {
        if (!confirm("Are you sure you want to revoke this certificate? This action is irreversible on the blockchain.")) return;
        
        setLoading(true);
        setUploadStatus("Initialising Revocation Protocol...");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = getContract(signer);

            const tx = await contract.revokeCertificate(hash);
            setUploadStatus("Broadcasting Revocation to Consensus...");
            await tx.wait();

            setUploadStatus("Certificate Permanently Invalidated.");
            loadHistory(); // Refresh
            setTimeout(() => setUploadStatus(""), 3000);
        } catch (error: any) {
            console.error("Revocation failed:", error);
            alert(error.reason || "Protocol failure during revocation");
        } finally {
            setLoading(false);
        }
    };

    const handleIssue = async () => {
        if (!file || !studentName || !certTitle) return;
        setLoading(true);
        setUploadStatus("Ingesting Asset to IPFS Cluster...");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = getContract(signer);

            const ipfsResult = await uploadToIPFS(file);
            if (!ipfsResult.success) {
                const err = new Error("IPFS_REJECTED");
                (err as any).details = ipfsResult.error;
                throw err;
            }

            const fileHash = await computeFileHash(file);
            
            // PRE-CHECK: Prevent duplicate issuance error
            setUploadStatus("Auditing Ledger for Duplicates...");
            const certData = await contract.certificates(fileHash);
            if (certData && certData.timestamp > BigInt(0)) {
                throw new Error("ALREADY_EXISTS");
            }

            setUploadStatus("Finalising Cryptographic Handshake...");

            // STRICT VALIDATION: Ethers.js v6 will crash with "reading .then" if arguments are undefined
            if (!fileHash) throw new Error("CRITICAL_ERROR: Content Hash is undefined");
            if (!studentName) throw new Error("CRITICAL_ERROR: Student Name is missing");
            if (!certTitle) throw new Error("CRITICAL_ERROR: Certificate Title is missing");
            if (!ipfsResult.cid) throw new Error("CRITICAL_ERROR: IPFS CID is missing from cluster response");

            console.log("Issuing Certificate with params:", {
                fileHash,
                studentName,
                certTitle,
                cid: ipfsResult.cid
            });

            const tx = await contract.issueCertificate(
                fileHash, 
                String(studentName), 
                String(certTitle), 
                String(ipfsResult.cid),
                { gasLimit: 500000 }
            );

            if (!tx) throw new Error("TRANSACTION_FAILED");

            setUploadStatus("Syncing with Global Consensus...");
            await tx.wait();

            if (!tx) throw new Error("Transaction bridge failed to initialize");

            setUploadStatus("Consensus Achieved. Record Immutable.");
            
            const newCert = {
                name: studentName,
                title: certTitle,
                hash: fileHash,
                cid: ipfsResult.cid,
                date: new Date().toLocaleDateString(),
                tx: tx.hash
            };

            setIssuedCerts(prev => [newCert, ...prev]);
            
            // Success reset
            setTimeout(() => {
                setFile(null);
                setStudentName("");
                setCertTitle("");
                setUploadStatus("");
            }, 3000);

        } catch (error: any) {
            console.error("Issuance failed:", error);
            
            let message = "Protocol level failure during issuance";
            
            if (error.message === "IPFS_REJECTED") {
                message = `IPFS Cluster Error: ${error.details || "Access Denied"}. Please verify your Pinata configuration.`;
            } else if (error.message === "ALREADY_EXISTS" || (error.data?.message && error.data.message.includes("Certificate already exists"))) {
                message = "The cryptographic proof for this document already exists on the ledger. Duplicates are restricted.";
            } else if (error.code === "ACTION_REJECTED") {
                message = "Transaction was rejected in your wallet.";
            } else if (error.reason) {
                message = `Protocol Error: ${error.reason}`;
            } else if (error.message) {
                message = `System Error: ${error.message}`;
            }

            alert(message);
            setUploadStatus("");
        }
        setLoading(false);
    };

    if (isIssuer === false) {
        return (
            <div className="min-h-screen bg-[var(--accents-1)] dark:bg-[#030303]">
                <Navbar />
                <main className="pt-48 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-20 glass-card rounded-[4rem] shadow-2xl border-rose-500/10 max-w-lg w-full">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                            <Lock className="w-12 h-12 text-rose-500" />
                        </div>
                        <h1 className="text-4xl font-black mb-6 tracking-tightest uppercase">Protocol Denied</h1>
                        <p className="text-zinc-500 leading-relaxed mb-12 font-medium">Your cryptographic key does not possess signing authority for this institutional partition.</p>
                        <button onClick={() => window.location.href = '/'} className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black tracking-widest text-sm uppercase shadow-xl">Return Home</button>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] transition-colors duration-500 flex flex-col xl:flex-row font-outfit">
            <Navbar />

            {/* Premium Sidebar - Fixed on Desktop, Hidden on Mobile */}
            <aside className="fixed left-6 top-32 bottom-6 w-80 glass-card rounded-[3.5rem] p-10 flex flex-col hidden xl:flex shadow-2xl z-50 overflow-hidden border-transparent">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                
                <div className="mb-16 relative">
                    <div className="flex items-center gap-4 px-2 mb-12">
                        <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black tracking-[0.2em] uppercase">Control</h4>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Issuer Node</p>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {[
                            { id: "issue", label: "Issue Record", icon: Plus },
                            { id: "history", label: "Ledger History", icon: History },
                            { id: "analytics", label: "Analytics", icon: Activity },
                            { id: "settings", label: "Config", icon: Settings },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group ${activeTab === item.id
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl scale-[1.02]"
                                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                {activeTab === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto space-y-6">
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Network</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black tracking-widest uppercase truncate">Mainnet Genesis</p>
                    </div>
                    <button className="w-full h-16 flex items-center gap-4 px-6 rounded-3xl text-rose-500 font-black text-xs uppercase hover:bg-rose-500/5 transition-colors tracking-widest">
                        <LogOut className="w-4 h-4" />
                        Terminate
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 xl:pl-96 pt-44 pb-32 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    {/* Mobile Navigation Segment - Only visible on small screens */}
                    <div className="xl:hidden flex gap-2 p-2 glass-card rounded-2xl mb-12 overflow-x-auto no-scrollbar">
                        {[
                            { id: "issue", label: "Issue", icon: Plus },
                            { id: "history", label: "Ledger", icon: History },
                            { id: "analytics", label: "Stats", icon: Activity },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                                    activeTab === item.id 
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg" 
                                    : "text-zinc-500"
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div>
                            <h1 className="text-7xl font-black tracking-tightest uppercase text-gradient leading-none mb-4">Console</h1>
                            <div className="flex gap-6 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stats.issued} Issued</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stats.revoked} Revoked</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card px-8 py-4 rounded-3xl border-transparent flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Authenticated As</p>
                                <p className="font-mono text-[10px] text-blue-500">{account?.substring(0, 16)}...</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-7 h-7 text-blue-500" />
                            </div>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        {activeTab === "issue" && (
                            <motion.div
                                key="issue"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                            >
                                <div className="glass-card rounded-[4rem] p-12 md:p-16 shadow-2xl relative overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
                                    <div className="absolute top-0 left-0 w-full h-2 brand-gradient" />
                                    <h3 className="text-4xl font-black mb-12 tracking-tightest uppercase text-gradient">Forge</h3>
                                    
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2">Recipient Legal Name</label>
                                            <input
                                                type="text"
                                                value={studentName}
                                                onChange={(e) => setStudentName(e.target.value)}
                                                placeholder="e.g. Alexander Pierce"
                                                className="w-full h-20 px-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl outline-none border border-zinc-100 dark:border-white/5 focus:border-blue-500/30 transition-all font-medium text-lg"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2">Credential Classification</label>
                                            <input
                                                type="text"
                                                value={certTitle}
                                                onChange={(e) => setCertTitle(e.target.value)}
                                                placeholder="e.g. B.Sc. Computer Science"
                                                className="w-full h-20 px-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl outline-none border border-zinc-100 dark:border-white/5 focus:border-blue-500/30 transition-all font-medium text-lg"
                                            />
                                        </div>

                                        <div className="pt-8">
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={handleIssue}
                                                disabled={!file || !studentName || !certTitle || loading}
                                                className="w-full h-24 brand-gradient text-white rounded-[2.5rem] font-black text-xl tracking-tightest flex items-center justify-center gap-4 premium-shadow disabled:opacity-30 disabled:grayscale transition-all"
                                            >
                                                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ShieldCheck className="w-7 h-7" />}
                                                <span>{loading ? "COMMITTING..." : "SEAL TO LEDGER"}</span>
                                            </motion.button>
                                            
                                            <AnimatePresence>
                                                {uploadStatus && (
                                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse italic">{uploadStatus}</motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Dropzone */}
                                <div
                                    className={`relative group border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-12 transition-all duration-500 ${file ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-blue-500/30"}`}
                                >
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="application/pdf" />
                                    <AnimatePresence mode="wait">
                                        {file ? (
                                            <motion.div key="file" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                                                <div className="w-32 h-32 brand-gradient rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/30">
                                                    <FileText className="w-16 h-16 text-white" />
                                                </div>
                                                <h4 className="text-3xl font-black mb-2 tracking-tightest">{file.name}</h4>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Asset Integrity Verified</p>
                                                <button onClick={() => setFile(null)} className="mt-8 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors">Clear Asset</button>
                                            </motion.div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-24 h-24 glass-card rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform premium-shadow">
                                                    <Upload className="w-10 h-10 text-zinc-300" />
                                                </div>
                                                <p className="text-2xl font-black tracking-tightest mb-2 uppercase">Drop IPFS Asset</p>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-loose text-center px-10">Supporting Portable Document Format (PDF) <br /> maximum load 10.0 MB</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "history" && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[4rem] shadow-2xl overflow-hidden border-transparent bg-white/70 dark:bg-zinc-900/80"
                                style={{ boxShadow: 'var(--card-shadow)' }}
                            >
                                <div className="p-12 border-b border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 bg-zinc-50/30 dark:bg-zinc-950/20">
                                    <div className="flex items-center gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black tracking-tightest uppercase text-gradient">Emission Logs</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time ledger audit</p>
                                        </div>
                                        <button 
                                            onClick={loadHistory}
                                            className="p-4 glass-card rounded-2xl bg-white dark:bg-zinc-900 hover:text-blue-500 transition-all hover:scale-110 active:scale-95 group shadow-sm"
                                            title="Sync with Ledger"
                                        >
                                            <Activity className="w-5 h-5 group-hover:animate-pulse" />
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="px-6 py-3 glass-card rounded-xl bg-blue-500/5 border-blue-500/10 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            Synchronized
                                        </div>
                                    </div>
                                </div>

                                {issuedCerts.length === 0 ? (
                                    <div className="py-40 text-center opacity-30 flex flex-col items-center">
                                        <History className="w-20 h-20 mb-8" />
                                        <p className="text-2xl font-black tracking-tightest uppercase">No Active States</p>
                                        <p className="text-xs font-medium max-w-[200px] mt-2">Historical emission records will appear here after blockchain finalization.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y dark:divide-white/5">
                                        {issuedCerts.map((cert, i) => (
                                            <div key={i} className="p-10 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-10">
                                                    <div className="w-20 h-20 glass-card rounded-[2rem] bg-white dark:bg-zinc-900 flex items-center justify-center shadow-md group-hover:border-blue-500/30 transition-all border-zinc-200/50 dark:border-transparent">
                                                        <Fingerprint className="w-10 h-10 text-blue-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-4">
                                                        <h4 className="text-3xl font-black tracking-tightest leading-none">{cert.name}</h4>
                                                        {cert.isValid ? (
                                                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest">Revoked</span>
                                                        )}
                                                        </div>
                                                        <p className="text-zinc-500 font-bold text-sm">{cert.title}</p>
                                                        <div className="flex items-center gap-4 mt-4">
                                                            <p className="text-[9px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-4 py-1.5 rounded-lg border dark:border-white/5">{cert.hash.substring(0, 32)}...</p>
                                                         </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                        <a href={`https://gateway.pinata.cloud/ipfs/${cert.cid}`} target="_blank" className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center hover:text-blue-600 transition-all premium-shadow border-transparent hover:border-blue-500/20">
                                                            <ExternalLink className="w-6 h-6" />
                                                        </a>
                                                    
                                                    {/* Better Local Dev Activity Handling */}
                                                    <div className="flex gap-4">
                                                        <button 
                                                            onClick={() => {
                                                                alert(`Transaction Hash: ${cert.tx}\n\nOn local Hardhat, Etherscan is not available. You can view this in your terminal logs.`);
                                                            }}
                                                            className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center hover:text-blue-500 transition-all premium-shadow border-transparent hover:border-blue-500/20"
                                                            title="View Transaction"
                                                        >
                                                            <Activity className="w-6 h-6" />
                                                        </button>
                                                        {cert.isValid && (
                                                            <button 
                                                                onClick={() => handleRevoke(cert.hash)}
                                                                className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center hover:text-rose-500 transition-all premium-shadow border-transparent hover:border-rose-500/20"
                                                                title="Revoke Certificate"
                                                            >
                                                                <Trash2 className="w-6 h-6" />
                                                            </button>
                                                        )}
                                                    </div>
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
