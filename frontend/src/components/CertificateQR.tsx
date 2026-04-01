"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check } from "lucide-react";

interface CertificateQRProps {
  hash: string;
}

export default function CertificateQR({ hash }: CertificateQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/?hash=${hash}`;
      setVerifyUrl(url);
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 180,
          margin: 1,
          color: {
            dark: "#0a0f1d",
            light: "#ffffff",
          },
        }, (error) => {
          if (error) console.error("QR Code Error:", error);
        });
      }
    }
  }, [hash]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `certificate-${hash.slice(2, 10)}.png`;
    link.href = url;
    link.click();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: 24, borderRadius: "var(--r-md)" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 16 }}>VERIFICATION QR CODE</p>
      
      <div style={{ background: "#ffffff", padding: 12, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", width: "fit-content", margin: "0 auto 16px" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={verifyUrl}>
          {verifyUrl}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button 
          onClick={downloadQR}
          style={{ 
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 36,
            background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)", 
            fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: "var(--r-sm)", transition: "all .15s" 
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--accent-dim)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <Download size={14} /> DOWNLOAD PNG
        </button>

        <button 
          onClick={copyUrl}
          style={{ 
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 36,
            background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)", 
            fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: "var(--r-sm)", transition: "all .15s" 
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--accent-dim)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} 
          {copied ? "COPIED" : "COPY LINK"}
        </button>
      </div>
    </div>
  );
}
