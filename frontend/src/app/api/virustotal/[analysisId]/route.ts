import { NextRequest, NextResponse } from "next/server";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_ANALYSIS_URL = "https://www.virustotal.com/api/v3/analyses/";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ analysisId: string }> }
) {
    if (!VIRUSTOTAL_API_KEY) {
        return NextResponse.json(
            { error: "Internal Configuration Error: API Key missing" },
            { status: 500 }
        );
    }

    const { analysisId } = await params;

    try {
        let fetchUrl = `${VIRUSTOTAL_ANALYSIS_URL}${analysisId}`;
        const isHash = /^[a-f0-9]{64}$/i.test(analysisId);

        if (isHash) {
            fetchUrl = `https://www.virustotal.com/api/v3/files/${analysisId}`;
        }

        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: {
                "x-apikey": VIRUSTOTAL_API_KEY,
            },
        });

        if (response.status === 429) {
            return NextResponse.json({ error: "Rate limited" }, { status: 429 });
        }

        if (response.status === 401) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("VT Polling Error:", errorText);
            return NextResponse.json({ error: "VirusTotal service error" }, { status: 500 });
        }

        const data = await response.json();
        const attributes = data.data.attributes;
        
        // Map stats based on whether we hit the /files or /analyses endpoint
        const stats = isHash ? attributes.last_analysis_stats : attributes.stats;
        const status = isHash ? "completed" : attributes.status;

        // isSafe is true ONLY when completed AND no malicious/suspicious detections
        const isSafe = status === "completed" && 
                      stats.malicious === 0 && 
                      stats.suspicious === 0;

        return NextResponse.json({
            status,
            stats: {
                malicious: stats.malicious,
                suspicious: stats.suspicious,
                harmless: stats.harmless,
                undetected: stats.undetected
            },
            isSafe
        });
    } catch (error: any) {
        console.error("VT Polling Route Error:", error);
        return NextResponse.json({ error: "Server error during polling" }, { status: 500 });
    }
}
