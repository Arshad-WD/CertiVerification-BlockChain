import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const metadata: Metadata = {
    title: "CertChain — Blockchain Certificate Verification",
    description: "Issue and verify tamper-proof academic credentials on the blockchain.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${inter.variable}`} suppressHydrationWarning>
            <body style={{ margin: 0, background: "#050911", color: "#f8fafc" }}>
                {children}
            </body>
        </html>
    );
}
