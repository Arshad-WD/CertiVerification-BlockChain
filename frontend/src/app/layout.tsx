import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const metadata: Metadata = {
    title: "BlockCert Vault Pro | Immutable Verification",
    description: "High-fidelity blockchain infrastructure for certificate verification",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
            <body className="font-outfit">{children}</body>
        </html>
    );
}
