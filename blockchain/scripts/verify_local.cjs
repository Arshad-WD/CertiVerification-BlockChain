const hre = require("hardhat");

async function main() {
    console.log("Starting verification script...");

    // Get the contract factory
    const CertificateVerifier = await hre.ethers.getContractFactory("CertificateVerifier");

    // Deploy the contract
    console.log("Deploying CertificateVerifier...");
    const verifier = await CertificateVerifier.deploy();
    await verifier.waitForDeployment();

    const address = await verifier.getAddress();
    console.log("CertificateVerifier deployed to:", address);

    // Test data
    const certificateHash = hre.ethers.id("Sample Certificate Content");

    // Issue a certificate
    console.log("Issuing certificate for hash:", certificateHash);
    try {
        const tx = await verifier.issueCertificate(certificateHash);
        await tx.wait();
        console.log("Certificate issued successfully!");

        // Verify the certificate
        console.log("Verifying certificate...");
        const [exists, valid, issuer, timestamp] = await verifier.verifyCertificate(certificateHash);

        console.log("Result:");
        console.log("- Exists:", exists);
        console.log("- Valid:", valid);
        console.log("- Issuer:", issuer);
        console.log("- Timestamp:", timestamp.toString());

        if (exists && valid) {
            console.log("SUCCESS: Certificate verified!");
        } else {
            console.log("FAILURE: Certificate not verified correctly.");
        }
    } catch (error) {
        console.error("Error during execution:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
