const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying CertificateVerifier...");

    const CertificateVerifier = await hre.ethers.getContractFactory("CertificateVerifier");
    const verifier = await CertificateVerifier.deploy({ gasLimit: 5000000 });
    await verifier.waitForDeployment();

    const address = await verifier.getAddress();
    console.log("✅ CertificateVerifier deployed to:", address);

    // --- Auto-sync the frontend .env.local ---
    const envPath = path.resolve(__dirname, "../../frontend/.env.local");
    try {
        let envContent = "";
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, "utf-8");
        }

        const addressKey = "NEXT_PUBLIC_CONTRACT_ADDRESS";
        const newLine = `${addressKey}=${address}`;

        if (envContent.includes(addressKey)) {
            // Replace existing line
            envContent = envContent.replace(
                new RegExp(`^${addressKey}=.*$`, "m"),
                newLine
            );
        } else {
            // Append if not present
            envContent = envContent.trimEnd() + "\n" + newLine + "\n";
        }

        fs.writeFileSync(envPath, envContent, "utf-8");
        console.log("✅ Auto-updated frontend/.env.local with new contract address");
        console.log("   Restart your Next.js dev server to pick up the change.");
    } catch (err) {
        console.warn("⚠️  Could not auto-update frontend/.env.local:", err.message);
        console.warn("   Manually set", `${addressKey}=${address}`, "in frontend/.env.local");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
