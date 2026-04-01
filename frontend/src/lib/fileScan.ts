/**
 * VirusTotal Scanner Library
 * Provides helpers for uploading files and polling scan results 
 * via the local Next.js API routes.
 */

export async function performVirusTotalScan(file: File): Promise<{ analysisId: string; sha256: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/virustotal", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
    }

    return await response.json();
}

export async function pollVirusTotalStatus(analysisId: string): Promise<{ 
    status: string; 
    isSafe: boolean; 
    stats: any 
}> {
    // Poll every 3 seconds until completed
    const maxRetries = 20;
    let retries = 0;

    while (retries < maxRetries) {
        const response = await fetch(`/api/virustotal/${analysisId}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Polling failed");
        }

        const data = await response.json();

        // If the process is completed or already finished (for hash lookups)
        if (data.status === "completed" || data.status === "found") {
            return {
                status: data.isSafe ? "safe" : "malicious",
                isSafe: data.isSafe,
                stats: data.stats
            };
        }

        // Wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        retries++;
    }

    throw new Error("Scan timeout: Global consensus not reached in time.");
}
