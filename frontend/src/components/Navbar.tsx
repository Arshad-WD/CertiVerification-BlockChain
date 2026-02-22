"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Database, ShieldCheck, Activity, Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        
        // Init theme state
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const navLinks = [
        { name: "Verify", path: "/", icon: ShieldCheck },
        { name: "Issuer Console", path: "/issuer", icon: LayoutDashboard },
        { name: "Governance", path: "/admin", icon: Database },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-4" : "py-8"}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className={`glass-card rounded-[2.5rem] px-8 py-4 flex items-center justify-between transition-all duration-500 ${isScrolled ? "shadow-2xl border-blue-500/10 bg-white/80 dark:bg-black/80" : "bg-white/40 dark:bg-transparent border-zinc-200/50 dark:border-transparent"}`}>
                    
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 group relative">
                        <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tightest uppercase text-gradient hidden xs:block">BLOCKCERT PRO</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                                    pathname === link.path 
                                    ? "text-blue-600 bg-blue-500/5" 
                                    : "text-zinc-500"
                                }`}
                            >
                                <link.icon className={`w-3.5 h-3.5 ${pathname === link.path ? "text-blue-500" : "text-zinc-400"}`} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Action Group */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent hover:border-blue-500/20 transition-all active:scale-95"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-blue-500" />
                            )}
                        </button>

                        <div className="hidden md:block w-[1px] h-6 bg-zinc-200 dark:bg-white/10" />
                        
                        <button className="hidden md:flex items-center gap-2 group">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Protocol Version</p>
                                <p className="text-[10px] font-black text-blue-500 uppercase">v2.4.0 Sealed</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                        </button>

                        {/* Mobile Toggle */}
                        <button 
                            className="md:hidden p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent active:scale-95"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-full left-6 right-6 mt-4 p-8 glass-card rounded-[3rem] shadow-2xl border-blue-500/10 md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-4 relative z-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between p-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${
                                        pathname === link.path 
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                                        : "bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-100 dark:border-white/5"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon className="w-5 h-5" />
                                        {link.name}
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-50" />
                                </Link>
                            ))}
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-10 -mt-10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
