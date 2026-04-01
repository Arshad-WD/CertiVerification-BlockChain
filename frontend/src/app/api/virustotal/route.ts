import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_FILE_URL = "https://www.virustotal.com/api/v3/files";
const VIRUSTOTAL_HASH_URL = "https://www.virustotal.com/api/v3/files/";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    if (!VIRUSTOTAL_API_KEY) {
        return NextResponse.json(
            { error: "Internal Configuration Error: API Key missing" },
            { status: 500 }
        );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
        return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Missing file field" }, { status: 400 });
        }

        // 1. Calculate SHA-256 Hash
        const buffer = await file.arrayBuffer();
        const hash = crypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex");
        console.log(`Checking VT for hash: ${hash}`);

        // 2. Pre-check: Does this file already exist in VT?
        const checkRes = await fetch(`${VIRUSTOTAL_HASH_URL}${hash}`, {
            headers: { "x-apikey": VIRUSTOTAL_API_KEY }
        });

        if (checkRes.ok) {
            const checkData = await checkRes.json();
            const analysisId = checkData.data.links?.self?.split("/").pop();
            if (analysisId) {
                console.log(`Found existing VR analysis: ${analysisId}`);
                return NextResponse.json({ analysisId, cached: true });
            }
        }

        // 3. Not found or no analysis ID, upload file
        const vtFormData = new FormData();
        vtFormData.append("file", file);

        const response = await fetch(VIRUSTOTAL_FILE_URL, {
            method: "POST",
            headers: { "x-apikey": VIRUSTOTAL_API_KEY },
            body: vtFormData,
        });

        const data = await response.json();

        // Handle "AlreadySubmitted" specifically if it slips through pre-check
        if (response.status === 400 && data.error?.code === "AlreadySubmittedError") {
            // If already submitted, the hash-based analysis ID is the best we can do
            // Actually VT analysis IDs are: {sha256}-{timestamp}. 
            // If we just return the hash, the polling endpoint might work if we adjust it.
            // But usually VT returns the analysis link in the response even for errors sometimes.
            return NextResponse.json({ 
                analysisId: hash, // In VT v3, we can often poll /analyses/{hash} or just use the hash
                status: "Already being submitted for scanning"
            });
        }

        if (!response.ok) {
            console.error("VT Upload Error:", data);
            return NextResponse.json({ error: data.error?.message || "VT Upload Refused" }, { status: response.status });
        }

        return NextResponse.json({ analysisId: data.data.id, sha256: hash });

    } catch (error: any) {
        console.error("VT Route Fatal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
