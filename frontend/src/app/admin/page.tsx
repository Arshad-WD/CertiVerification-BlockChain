"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import { 
    ShieldAlert, Users, Plus, Trash2, Loader2, 
    ShieldCheck, Database, LayoutDashboard, Activity,
    Shield, Lock, Fingerprint, Sparkles, Send, CheckCircle2,
    Briefcase, UserPlus, UserMinus, Globe, Zap, List, Grid
} from "lucide-react";
import { getContract, EXPECTED_CHAIN_ID, checkContractSync, getPublicContract } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
    const [account, setAccount] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalIssued: 0,
        totalRevoked: 0,
        activeIssuers: 0
    });
    const [newIssuer, setNewIssuer] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        checkOwnerStatus();
        loadStats();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, []);

    const checkOwnerStatus = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                setAccount(accounts[0]);

                const contract = getContract(provider);
                const owner = await contract.owner();
                setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
            } catch (error) {
                console.error("Error checking owner status:", error);
            }
        }
    };

    const loadStats = async () => {
        // First check system integrity using stable public provider
        const syncStatus = await checkContractSync();
        if (syncStatus === "MISSING" || syncStatus === "OFFLINE") {
            setStatus("Critical: Local blockchain node is offline or contract not found.");
            return;
        }
        if (syncStatus === "MISMATCH") {
            setStatus("Warning: Blockchain protocol mismatch. Redeploy suggested.");
            return;
        }

        try {
            const contract = getPublicContract();
            const issued = await contract.totalIssued();
            const revoked = await contract.totalRevoked();
            
            setStats({
                totalIssued: Number(issued),
                totalRevoked: Number(revoked),
                activeIssuers: 0
            });
        } catch (error: any) {
            console.error("Stable Provider fallback failed:", error);
            setStatus("Protocol read failure.");
        }
    };

    const handleAddIssuer = async () => {
        if (!newIssuer || !ethers.isAddress(newIssuer)) {
            alert("Please enter a valid wallet address.");
            return;
        }

        setLoading(true);
        setStatus("Approving Issuer Role on-chain...");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = getContract(signer);

            const tx = await contract.addIssuer(newIssuer);
            await tx.wait();
            
            setStatus("Issuer Successfully Licensed.");
            setNewIssuer("");
            setTimeout(() => setStatus(""), 3000);
        } catch (error: any) {
            console.error("Failed to add issuer:", error);
            alert(error.reason || "Protocol failure while adding issuer");
            setStatus("");
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-white dark:bg-black font-plus-jakarta flex items-center justify-center p-6">
                <div className="glass-card p-12 rounded-[3rem] text-center max-w-md border-red-500/20">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-gradient mb-4">Access Restricted</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                        This terminal is reserved for Protocol Administrators. Your cryptographic signature does not grant governance rights.
                    </p>
                    <button 
                        onClick={() => window.location.href = "/"}
                        className="w-full py-4 glass-card bg-zinc-950 text-white rounded-2xl font-bold hover:scale-105 transition-all"
                    >
                        Return to Safe Zone
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--accents-1)] dark:bg-[#030303] text-zinc-900 dark:text-white font-plus-jakarta transition-colors duration-500 overflow-x-hidden">
            <Navbar />
            
            <main className="max-w-[1600px] mx-auto px-6 md:px-10 pt-40 pb-32">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 px-5 py-2 glass-card rounded-full w-fit border-blue-500/20 bg-blue-500/5">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Root Governance Console</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.9]">
                            PROTOCOL <br />
                            <span className="text-gradient">CONTROL</span>
                        </h1>
                    </motion.div>

                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="glass-card px-8 py-6 rounded-[2rem] flex-1 lg:flex-none flex items-center gap-6 border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-3xl">
                             <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/5">
                                <Activity className="w-6 h-6 text-zinc-400" />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">System Health</p>
                                <p className="text-xl font-black tracking-tightest">SYNCHRONIZED</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {[
                        { label: "Total Proofs", value: stats.totalIssued, icon: Database, color: "blue" },
                        { label: "Revoked Records", value: stats.totalRevoked, icon: ShieldAlert, color: "red" },
                        { label: "Authorized Issuers", value: "ACTIVE", icon: Users, color: "indigo" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-10 rounded-[3rem] border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 relative group overflow-hidden"
                            style={{ boxShadow: 'var(--card-shadow)' }}
                        >
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 mb-2">{stat.label}</p>
                                    <h4 className="text-4xl md:text-5xl font-black tracking-tightest">{stat.value}</h4>
                                </div>
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                        </motion.div>
                    ))}
                </div>

                {/* Governance Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-[4rem] p-12 border-zinc-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-900/60"
                        style={{ boxShadow: 'var(--card-shadow)' }}
                    >
                        <h2 className="text-4xl font-black mb-10 tracking-tightest uppercase text-gradient">Manage Issuers</h2>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-4">License New Wallet</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                                        <UserPlus className="h-5 w-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        value={newIssuer}
                                        onChange={(e) => setNewIssuer(e.target.value)}
                                        className="block w-full pl-16 pr-8 py-7 glass-card rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950/50 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-400 tracking-tightest font-bold text-lg border-2 border-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddIssuer}
                                disabled={loading}
                                className="w-full py-8 glass-card bg-zinc-950 dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black tracking-tightest uppercase text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-blue-500/10"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Grant License
                                        <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                            <Send className="w-4 h-4" />
                                        </div>
                                    </>
                                )}
                            </button>

                            <AnimatePresence>
                                {status && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-6 glass-card rounded-3xl bg-green-500/5 border-green-500/20 flex items-center gap-4 border"
                                    >
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-bold tracking-tightest text-green-500">{status}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-[4rem] p-12 border-zinc-200/50 dark:border-white/5 bg-zinc-950/5 dark:bg-zinc-900/20 flex flex-col items-center justify-center text-center space-y-8 shadow-sm"
                        style={{ boxShadow: 'var(--card-shadow)' }}
                    >
                        <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900/5 dark:bg-white/5 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/10">
                            <Lock className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-3">Protocol Safety</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm font-medium leading-relaxed">
                                Licensing a wallet as an Issuer allows it to write permanent records to the blockchain. Use this console with cryptographic caution.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <span className="px-5 py-2 glass-card rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-white/5">Multi-Sig Ready</span>
                            <span className="px-5 py-2 glass-card rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-white/5">Auto-Audit</span>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
