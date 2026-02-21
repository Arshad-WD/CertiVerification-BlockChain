"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import {
    UserPlus, UserMinus, ShieldAlert, Users, Loader2, Search,
    CheckCircle, Info, ShieldCheck, Key, Zap, Fingerprint,
    History, Settings, Shield, Clock, ExternalLink, MoreVertical,
    AlertCircle, Lock, LayoutGrid, List
} from "lucide-react";
import { getContract } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
    const [account, setAccount] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState<boolean | null>(null);
    const [newIssuer, setNewIssuer] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Enterprise State
    const [issuers, setIssuers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        checkOwner();
        // Simulate some logs for the UI brief
        setLogs([
            { event: "Access Revoked", subject: "0x7099...79C8", time: "2h ago", status: "Critical" },
            { event: "New Authority", subject: "0x3C44...216b", time: "5h ago", status: "Secure" },
            { event: "Root Rotation", subject: "SYSTEM", time: "1d ago", status: "Success" },
        ]);
    }, []);

    const checkOwner = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);

                const contract = await getContract(provider);
                const owner = await contract.owner();
                setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
            } catch (error) {
                console.error("Error checking owner status:", error);
            }
        }
    };

    const manageIssuer = async (add: boolean) => {
        if (!ethers.isAddress(newIssuer)) {
            alert("Invalid Ethereum address signature detected.");
            return;
        }
        setLoading(true);
        setStatus(add ? "Authorizing Protocol Signature..." : "Revoking Authority...");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = await getContract(signer);

            const tx = add
                ? await contract.addIssuer(newIssuer)
                : await contract.removeIssuer(newIssuer);

            await tx.wait();
            setStatus(`Success: Institutional Root ${add ? 'Authenticated' : 'De-authorized'}`);
            setNewIssuer("");

            // Update logs
            setLogs(prev => [{
                event: add ? "Access Granted" : "Access Revoked",
                subject: `${newIssuer.substring(0, 6)}...${newIssuer.substring(38)}`,
                time: "Just now",
                status: add ? "Secure" : "Critical"
            }, ...prev]);

        } catch (error: any) {
            console.error("Operation failed:", error);
            alert(error.message || "Protocol execution error");
        }
        setLoading(false);
        setTimeout(() => setStatus(""), 6000);
    };

    if (isOwner === false) {
        return (
            <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303]">
                <Navbar />
                <main className="pt-48 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-20 rounded-[4rem] shadow-2xl border-rose-500/10 max-w-xl">
                        <div className="bg-rose-500/10 p-10 rounded-[2.5rem] mb-12 mx-auto w-fit">
                            <Lock className="w-20 h-20 text-rose-500" />
                        </div>
                        <h1 className="text-5xl font-black mb-8 tracking-tightest">Access Denied</h1>
                        <p className="text-zinc-500 leading-[1.8] mb-12 font-medium">
                            Administrative privileges are restricted to the protocol architect.
                            Your current cryptographic signature does not grant governance access.
                        </p>
                        <button onClick={() => window.location.href = '/'} className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black tracking-widest text-sm uppercase">Return to Public Layer</button>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303]">
            <Navbar />

            <main className="pt-44 pb-32 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">

                {/* Governance Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white dark:text-zinc-900" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Institutional Governance</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tightest text-gradient uppercase">Admin</h1>
                        <p className="text-zinc-500 font-medium mt-2">Manage authoritative keys and system-level delegations.</p>
                    </div>

                    <div className="glass-card px-8 py-5 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Architecture Root</p>
                            <p className="font-mono text-xs text-zinc-400">{account}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-emerald-500" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

                    {/* Primary Controls */}
                    <div className="xl:col-span-2 space-y-12">

                        {/* Promotion UI */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-[4rem] p-16 shadow-2xl border-white/40 dark:border-white/5"
                        >
                            <h2 className="text-3xl font-black mb-12 tracking-tightest uppercase flex items-center gap-4">
                                <Key className="w-8 h-8 text-blue-600" />
                                Key Promotion
                            </h2>
                            <div className="relative mb-10">
                                <input
                                    type="text"
                                    value={newIssuer}
                                    onChange={(e) => setNewIssuer(e.target.value)}
                                    placeholder="Enter Recipient Wallet Address (0x...)"
                                    className="w-full h-24 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-950/50 border-2 border-transparent focus:border-blue-500/30 rounded-3xl outline-none font-mono text-base transition-all"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-8">
                                <button
                                    onClick={() => manageIssuer(true)}
                                    disabled={loading || !newIssuer}
                                    className="flex-1 h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-lg flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading && status.includes("Authorizing") ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
                                    PROMOTE AUTHORITY
                                </button>
                                <button
                                    onClick={() => manageIssuer(false)}
                                    disabled={loading || !newIssuer}
                                    className="flex-1 h-20 bg-white dark:bg-zinc-900 border-2 border-rose-500/20 text-rose-500 rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:bg-rose-500/5 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading && status.includes("Revoking") ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserMinus className="w-6 h-6" />}
                                    REVOKE RIGHTS
                                </button>
                            </div>
                            <AnimatePresence>
                                {status && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center text-xs font-black uppercase tracking-widest text-blue-500 animate-pulse">{status}</motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Data Dense Table */}
                        <div className="glass-card rounded-[4rem] shadow-2xl border-white/40 dark:border-white/5 overflow-hidden">
                            <div className="p-12 border-b dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                                <h3 className="text-2xl font-black tracking-tightest uppercase flex items-center gap-4">
                                    <List className="w-6 h-6 text-zinc-400" />
                                    Authorization Registry
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Deep Search..."
                                        className="h-12 pl-12 pr-6 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-white/5 rounded-2xl outline-none text-xs focus:border-blue-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                            <th className="px-12 py-8">Subject Identifier</th>
                                            <th className="px-12 py-8">Role Type</th>
                                            <th className="px-12 py-8">Security Status</th>
                                            <th className="px-12 py-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-white/5">
                                        {[
                                            { addr: account, role: "ROOT ARCHITECT", status: "SECURE" },
                                            { addr: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", role: "DELEGATED ISSUER", status: "VERIFIED" },
                                            { addr: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", role: "AUDITOR PROXY", status: "LOCKED" },
                                        ].map((item, i) => (
                                            <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                                                <td className="px-12 py-8 font-mono text-xs text-zinc-500">{item.addr}</td>
                                                <td className="px-12 py-8">
                                                    <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg tracking-widest text-zinc-500">{item.role}</span>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SECURE' ? 'bg-emerald-500' : item.status === 'VERIFIED' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                                        <span className="text-[10px] font-black tracking-widest text-zinc-400">{item.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8 text-right">
                                                    <button className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl hover:text-blue-600 transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Activity Logs */}
                    <aside className="space-y-10">
                        <div className="glass-card rounded-[3.5rem] p-12 border-white/40 dark:border-white/5 shadow-2xl h-full">
                            <h3 className="text-2xl font-black mb-10 tracking-tightest uppercase flex items-center gap-4">
                                <History className="w-6 h-6 text-blue-600" />
                                Audit Logs
                            </h3>
                            <div className="space-y-8">
                                {logs.map((log, i) => (
                                    <div key={i} className="relative pl-8 border-l-2 border-zinc-100 dark:border-white/5 pb-2">
                                        <div className={`absolute top-0 left-[-5px] w-2 h-2 rounded-full ${log.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black tracking-tightest uppercase">{log.event}</p>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{log.time}</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-zinc-500 mb-2 truncate">{log.subject}</p>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${log.status === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>{log.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

            </main>
        </div>
    );
}
