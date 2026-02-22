"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import {
    Search, Loader2, CheckCircle2, XCircle, FileText, Upload, Shield,
    Fingerprint, History, ArrowRight, Sparkles, Zap, ShieldCheck,
    Lock, Globe, Database, Cpu, ExternalLink, Activity
} from "lucide-react";
import { computeFileHash, verifyCertificateHash } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [certId, setCertId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.ethereum) {
            window.ethereum.on('accountsChanged', () => window.location.reload());
            window.ethereum.on('chainChanged', () => window.location.reload());
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setResult(null);
        try {
            let hashToVerify = certId;
            if (file) {
                hashToVerify = await computeFileHash(file);
            }

            if (!hashToVerify) {
                alert("Please provide a file or Certificate ID");
                setLoading(false);
                return;
            }

            // Perform verification using the stable Public Provider
            const verificationResult = await verifyCertificateHash(hashToVerify);
            setResult(verificationResult);
        } catch (error) {
            console.error("Verification failed:", error);
            alert("Verification failed. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] transition-colors duration-500 overflow-x-hidden selection:bg-blue-500/30">
            <Navbar />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="relative pt-32 pb-32 z-10">
                {/* Hero Section */}
                <section className="px-6 lg:px-8 max-w-7xl mx-auto text-center mb-32 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card mb-8 shadow-sm border-blue-500/20"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">The Gold Standard of Trust</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tightest leading-[0.9] md:leading-[0.85] mb-12"
                    >
                        <span className="text-gradient">Immutable</span> <br />
                        <span className="text-blue-600">Verification.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto mb-16"
                    >
                        Decentralized cryptographic infrastructure for educational credentials. 
                        Authenticating excellence with mathematical certainty on the global ledger.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center gap-6"
                    >
                        <button 
                            onClick={() => document.getElementById('verify-interface')?.scrollIntoView({ behavior: 'smooth' })}
                            className="h-16 px-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black tracking-widest text-sm uppercase hover-lift premium-shadow"
                        >
                            Get Started
                        </button>
                        <button className="h-16 px-10 border border-zinc-200 dark:border-white/10 rounded-2xl font-black tracking-widest text-sm uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors hover-lift">
                            Documentation
                        </button>
                    </motion.div>
                </section>

                {/* Core Stats / Tech Grid */}
                <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Database, bg: "bg-blue-500/10", color: "text-blue-500", title: "Persistence", desc: "Permanent on-chain records" },
                            { icon: ShieldCheck, bg: "bg-emerald-500/10", color: "text-emerald-500", title: "Security", desc: "Tamper-proof by design" },
                            { icon: Activity, bg: "bg-amber-500/10", color: "text-amber-500", title: "Auditable", desc: "Transparent history" },
                            { icon: Globe, bg: "bg-purple-500/10", color: "text-purple-500", title: "Global", desc: "Universally verifiable" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 glass-card rounded-3xl border-transparent hover:border-blue-500/20 transition-all group hover-lift bg-white/40 dark:bg-zinc-900/40 shadow-sm"
                                style={{ boxShadow: 'var(--card-shadow)' }}
                            >
                                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-black mb-2 tracking-tightest uppercase">{item.title}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Verification Interface */}
                <section id="verify-interface" className="px-6 lg:px-8 max-w-5xl mx-auto mb-40">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-6xl font-black tracking-tightest uppercase mb-6 text-gradient">Audit Engine</h2>
                        <p className="text-zinc-500 font-medium px-4">Verify any certificate in seconds using its hash or file payload.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Issue Portal Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-12 glass-card rounded-[3rem] premium-shadow group border-transparent hover:border-blue-500/30 transition-all bg-white/60 dark:bg-zinc-900/60"
                            style={{ boxShadow: 'var(--card-shadow)' }}
                        >
                            <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform">
                                <FileText className="w-8 h-8 text-white dark:text-zinc-900" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tightest uppercase leading-none">Issue Root</h3>
                            <p className="text-sm text-zinc-500 mb-12 font-medium leading-relaxed">Commit high-fidelity credentials to the genesis layer.</p>
                            <button
                                onClick={() => window.location.href = '/issuer'}
                                className="w-full h-20 brand-gradient text-white rounded-3xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                            >
                                ACCESS CONSOLE
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Verify Portal Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-12 glass-card rounded-[3rem] premium-shadow border-blue-600/20 bg-blue-600/[0.03] dark:bg-blue-600/[0.05] group"
                            style={{ boxShadow: 'var(--card-shadow)' }}
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 group-hover:-rotate-6 transition-transform shadow-lg shadow-blue-500/30">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tightest uppercase leading-none text-blue-600">Verification</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-6 h-16 px-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5 cursor-pointer hover:border-blue-500/50 transition-colors">
                                    <Upload className="w-5 h-5 text-zinc-400" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">{file ? file.name : "Select Document"}</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="application/pdf" />
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Cryptographic Hash..."
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                    className="w-full h-16 px-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5 outline-none focus:border-blue-500 transition-all font-mono text-[10px]"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading}
                                    className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "EXECUTE AUDIT"}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Verification Result Display */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="mt-12 p-12 glass-card rounded-[3.5rem] border-2 border-white dark:border-white/5 premium-shadow text-center relative overflow-hidden bg-white/80 dark:bg-black/40"
                                style={{ boxShadow: 'var(--card-shadow)' }}
                            >
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${result.exists && result.valid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mb-10 mx-auto shadow-2xl ${result.exists && result.valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {result.exists && result.valid ? <CheckCircle2 className="w-14 h-14" /> : <XCircle className="w-14 h-14" />}
                                </div>
                                <h3 className="text-5xl font-black mb-4 tracking-tightest uppercase text-gradient">
                                    {result.exists && result.valid ? "Authenticated" : "Tamper Detected"}
                                </h3>
                                <p className="text-zinc-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed">
                                    {result.exists && result.valid
                                        ? "Cryptographic proof confirms this record exists on the genesis chain."
                                        : "Certificate integrity could not be verified. Hash mismatch detected."}
                                </p>

                                {result.exists && result.valid && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                                        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5">
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Authority Signature</span>
                                            <p className="font-mono text-[10px] break-all text-zinc-600 dark:text-zinc-300">{result.issuer}</p>
                                        </div>
                                        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5">
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Sealing Date</span>
                                            <p className="font-black text-2xl tracking-tighter">{new Date(Number(result.timestamp) * 1000).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Infrastructure Highlight */}
                <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-40">
                    <div className="glass-card rounded-[4rem] p-16 md:p-24 overflow-hidden relative bg-white/40 dark:bg-zinc-950/20" style={{ boxShadow: 'var(--card-shadow)' }}>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] -mr-40 -mt-40 rounded-full" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tightest uppercase mb-10 text-gradient leading-none">Powered by <br /> <span className="text-blue-600">Blockchain.</span></h2>
                                <p className="text-lg text-zinc-500 font-medium mb-12 leading-relaxed">
                                    Leveraging distributed consensus to create a permanent, tamper-proof record of educational achievement. 
                                    No central authority can alter historical data.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: "Immutable Ledger", desc: "Hash-based sealling ensures permanent historical accuracy." },
                                        { title: "Distributed Trust", desc: "No single point of failure in information retrieval." },
                                        { title: "Instant Verification", desc: "Zero-latency authentication for employers and institutions." }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                                            <div>
                                                <h4 className="font-black uppercase tracking-widest text-xs mb-1">{feat.title}</h4>
                                                <p className="text-sm text-zinc-500 font-medium">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="aspect-square bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 p-10 flex flex-col justify-between premium-shadow hover-lift">
                                        <Cpu className="w-10 h-10 text-blue-600" />
                                        <span className="text-3xl font-black tracking-tightest leading-none">Deterministic Execution.</span>
                                    </div>
                                    <div className="aspect-[4/5] bg-zinc-900 dark:bg-white rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl hover-lift animate-float">
                                        <Database className="w-10 h-10 text-white dark:text-zinc-900" />
                                        <span className="text-3xl font-black tracking-tightest leading-none text-white dark:text-zinc-900">Encrypted Metadata.</span>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-12">
                                    <div className="aspect-[4/5] brand-gradient rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl hover-lift animate-float" style={{ animationDelay: '1s' }}>
                                        <Lock className="w-10 h-10 text-white" />
                                        <span className="text-3xl font-black tracking-tightest leading-none text-white">Quantum Resilient.</span>
                                    </div>
                                    <div className="aspect-square bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 p-10 flex flex-col justify-between premium-shadow hover-lift">
                                        <Globe className="w-10 h-10 text-blue-600" />
                                        <span className="text-3xl font-black tracking-tightest leading-none">Global Network.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Institutional Footer */}
            <footer className="bg-white dark:bg-black border-t border-zinc-100 dark:border-white/5 pt-32 pb-20 px-6 relative z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/[0.02] blur-[120px] rounded-full -mt-40 pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <span className="text-2xl font-black tracking-tightest uppercase text-gradient">BLOCKCERT PRO</span>
                        </div>
                        <p className="text-zinc-500 font-medium leading-relaxed mb-10">
                            Powering the next generation of institutional trust through decentralized identity 
                            and immutable architectural patterns.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center hover:text-blue-600 transition-colors cursor-pointer">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center hover:text-blue-600 transition-colors cursor-pointer">
                                <Search className="w-4 h-4" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center hover:text-blue-600 transition-colors cursor-pointer">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-20">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Infrastructure</h4>
                            <ul className="space-y-4 text-xs font-black uppercase text-zinc-500">
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Explorer</li>
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Consensus</li>
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Validator Node</li>
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Bridge</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Security</h4>
                            <ul className="space-y-4 text-xs font-black uppercase text-zinc-500">
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Audits</li>
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">TPS Status</li>
                                <li className="hover:text-blue-600 cursor-pointer transition-colors">Legal Proxy</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-zinc-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">© 2026 BLOCKCERT PROTOCOL • AUTHORIZED USE ONLY</p>
                    <div className="flex gap-8">
                      <span className="text-[9px] font-black text-zinc-500 hover:text-blue-600 cursor-pointer">PRIVACY</span>
                      <span className="text-[9px] font-black text-zinc-500 hover:text-blue-600 cursor-pointer">TERMS</span>
                      <span className="text-[9px] font-black text-zinc-500 hover:text-blue-600 cursor-pointer">ENCRYPTION</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
