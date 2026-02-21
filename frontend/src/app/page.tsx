"use client";

import { useState } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import {
    Search, Loader2, CheckCircle2, XCircle, FileText, Upload, Shield,
    Fingerprint, History, ArrowRight, Sparkles, Zap, ShieldCheck,
    Lock, Globe, Database, Cpu
} from "lucide-react";
import { computeFileHash, verifyCertificateHash } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [certId, setCertId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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

            const provider = new ethers.BrowserProvider(window.ethereum);
            const verificationResult = await verifyCertificateHash(hashToVerify, provider);
            setResult(verificationResult);
        } catch (error) {
            console.error("Verification failed:", error);
            alert("Verification failed. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303] overflow-hidden selection:bg-blue-500/30">
            <Navbar />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative pt-44 pb-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">

                {/* Institutional Hero */}
                <div className="text-center mb-32 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card mb-10 shadow-sm border-blue-500/10"
                    >
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">Enterprise Grade Immutability</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-7xl md:text-9xl font-black tracking-tightest leading-[0.9] mb-10 text-gradient"
                    >
                        Tamper-Proof <br />
                        <span className="text-blue-600">Verification.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        A decentralized protocol for authenticating educational credentials with
                        mathematical certainty on the global ledger.
                    </motion.p>
                </div>

                {/* 3-Step Visual Flow */}
                <section className="mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">The Verification Lifecycle</h2>
                        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />

                        {[
                            { step: "01", title: "Ingestion", desc: "Upload document or enter unique cryptographic hash.", icon: Upload },
                            { step: "02", title: "Consensus", desc: "Cross-reference with decentralized global nodes.", icon: Globe },
                            { step: "03", title: "Validity", desc: "Receive mathematically proven verification status.", icon: ShieldCheck },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="relative z-10 p-10 glass-card rounded-[2.5rem] border-white/40 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-xl"
                            >
                                <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                                    <item.icon className="w-8 h-8 text-white dark:text-zinc-900" />
                                </div>
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">Step {item.step}</span>
                                <h3 className="text-2xl font-black mb-4 tracking-tighter">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Action Interface */}
                <div id="verify" className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-12 glass-card rounded-[3.5rem] shadow-2xl border-white/40 dark:border-white/5 group"
                    >
                        <div className="p-4 bg-zinc-900 dark:bg-white rounded-2xl w-fit mb-10 group-hover:rotate-6 transition-transform">
                            <FileText className="w-8 h-8 text-white dark:text-zinc-900" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tightest">Issue Certificate</h2>
                        <p className="text-sm text-zinc-500 mb-10 leading-relaxed font-medium">Authorized institutions can commit new records to the immutable ledger.</p>
                        <button
                            onClick={() => window.location.href = '/issuer'}
                            className="w-full h-20 bg-blue-600 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                        >
                            ISSUE NOW
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-12 glass-card rounded-[3.5rem] shadow-2xl border-blue-500/10 group bg-blue-600/[0.02]"
                    >
                        <div className="p-4 bg-blue-600 rounded-2xl w-fit mb-10 group-hover:-rotate-6 transition-transform shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tightest">Verify Legacy</h2>
                        <p className="text-sm text-zinc-500 mb-10 leading-relaxed font-medium">Empower stakeholders to authenticate credentials instantly and for free.</p>
                        <div className="space-y-4">
                            <label className="flex items-center gap-6 h-20 px-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-blue-500/50 transition-colors">
                                <Upload className="w-6 h-6 text-zinc-400" />
                                <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">{file ? file.name : "Select PDF Asset"}</span>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="application/pdf" />
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Or enter Hash ID (0x...)"
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                    className="w-full h-20 px-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-500 transition-all font-mono text-xs"
                                />
                            </div>
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:opacity-90 transition-all"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "RUN VERIFICATION"}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Results with Feedback */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto mb-40 glass-card rounded-[4rem] border-2 border-white dark:border-white/5 bg-white dark:bg-zinc-900 shadow-2xl p-20 text-center"
                        >
                            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-2xl ${result.exists && result.valid ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                                {result.exists && result.valid ? <CheckCircle2 className="w-16 h-16 text-white" /> : <XCircle className="w-16 h-16 text-white" />}
                            </div>

                            <h3 className="text-5xl font-black mb-4 tracking-tightest uppercase">
                                {result.exists && result.valid ? "Authenticated" : "Tampered"}
                            </h3>
                            <p className="text-zinc-500 mb-12 max-w-sm mx-auto font-medium">
                                {result.exists && result.valid
                                    ? "Cryptographic proof confirms this record exists on the genesis chain."
                                    : "No matching record detected. This document may have been altered."}
                            </p>

                            {result.exists && result.valid && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                                    <div className="p-10 bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-white/5">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Digital Signature</span>
                                        <p className="font-mono text-xs break-all text-zinc-600 dark:text-zinc-300">{result.issuer}</p>
                                    </div>
                                    <div className="p-10 bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-white/5">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Genesis Block</span>
                                        <p className="font-black text-2xl tracking-tighter">{new Date(Number(result.timestamp) * 1000).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Global Infrastructure Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: Cpu, title: "Deterministic", desc: "Hash-based verification ensures identical results across all global nodes." },
                        { icon: Database, title: "Immutable", desc: "Genesis records cannot be altered, deleted, or revoked once committed." },
                        { icon: Globe, title: "Distributed", desc: "Operates on a decentralized network with no single point of failure." }
                    ].map((tech, i) => (
                        <div key={i} className="text-center group">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-200 dark:border-white/5 transition-transform group-hover:scale-110">
                                <tech.icon className="w-10 h-10 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <h4 className="text-2xl font-black mb-4 tracking-tighter">{tech.title}</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">{tech.desc}</p>
                        </div>
                    ))}
                </div>

            </main>

            {/* Institutional Footer */}
            <footer className="border-t border-zinc-100 dark:border-white/5 pt-32 pb-20 px-6 bg-white dark:bg-black relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-10">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <span className="text-2xl font-black tracking-tightest uppercase text-gradient">BlockCert Pro</span>
                        </div>
                        <p className="text-zinc-500 max-w-sm font-medium leading-[1.8]">
                            Powering the next generation of institutional trust through decentralized identity
                            and immutable credentialing systems.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">Infrastructure</h5>
                        <ul className="space-y-6 text-sm font-black uppercase text-zinc-500">
                            <li className="hover:text-blue-600 cursor-pointer transition-colors">Audit Node</li>
                            <li className="hover:text-blue-600 cursor-pointer transition-colors">Explorer</li>
                            <li className="hover:text-blue-600 cursor-pointer transition-colors">Consensus</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">Trust Protocol</h5>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 border dark:border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">TLS 1.3</div>
                            <div className="px-4 py-2 border dark:border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">SHA-256</div>
                            <div className="px-4 py-2 border dark:border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">EVM-Compatible</div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-zinc-100 dark:border-white/5 text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">© 2026 BlockCert Protocol • Authorized Use Only</p>
                </div>
            </footer>
        </div>
    );
}
