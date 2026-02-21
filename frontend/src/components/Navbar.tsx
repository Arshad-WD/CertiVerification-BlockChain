"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { Shield, LayoutDashboard, Settings, Wallet, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [account, setAccount] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);
            } catch (error) {
                console.error("Wallet connection failed:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const navLinks = [
        { name: "Verify", href: "/", icon: Shield },
        { name: "Issuer", href: "/issuer", icon: LayoutDashboard },
        { name: "Admin", href: "/admin", icon: Settings },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 pointer-events-none">
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
          pointer-events-auto
          flex items-center justify-between
          w-full max-w-5xl px-6 py-2.5
          rounded-full border transition-all duration-500
          ${scrolled
                        ? "glass-card shadow-2xl shadow-black/5 py-2 px-4"
                        : "bg-white/50 dark:bg-zinc-900/50 border-transparent shadow-none"
                    }
        `}
            >
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-zinc-900 dark:bg-white rounded-full group-hover:rotate-12 transition-transform duration-500">
                        <Shield className="w-5 h-5 text-white dark:text-zinc-900" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-white/20 dark:border-black/10 rounded-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tightest leading-none">BLOCK<span className="text-blue-600">CERT</span></span>
                        <span className="text-[10px] font-bold text-zinc-400 leading-none mt-0.5">VAULT PRO</span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative px-4 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group"
                        >
                            <span className="relative z-10">{link.name}</span>
                            <motion.div
                                className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                layoutId="nav-bg"
                            />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={connectWallet}
                        className="hidden md:flex items-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-xs font-black shadow-lg shadow-black/10 transition-all hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white"
                    >
                        {account ? (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{`${account.substring(0, 5)}...${account.substring(account.length - 4)}`}</span>
                            </>
                        ) : (
                            <>
                                <Wallet className="w-3.5 h-3.5" />
                                <span>CONNECT WALLET</span>
                            </>
                        )}
                    </motion.button>

                    <button
                        className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-24 left-4 right-4 p-6 glass-card rounded-[2rem] md:hidden pointer-events-auto shadow-2xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex justify-between items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold">{link.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                                </Link>
                            ))}

                            <button
                                onClick={connectWallet}
                                className="w-full h-16 bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-3 mt-4"
                            >
                                <Wallet className="w-5 h-5" />
                                {account ? "CONNECTED" : "SIGN IN"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
