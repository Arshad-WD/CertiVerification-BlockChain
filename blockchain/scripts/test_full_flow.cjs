const hre = require("hardhat");

async function main() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const [owner] = await hre.ethers.getSigners();
    
    console.log(`Using address: ${address}`);
    console.log(`Signer: ${owner.address}`);

    try {
        const contract = await hre.ethers.getContractAt("CertificateVerifier", address);
        
        console.log("Issuing test certificate...");
        const hash = hre.ethers.id("Terminal Test " + Date.now());
        const tx = await contract.issueCertificate(hash, "Test", "Test", "QmMock");
        await tx.wait();
        console.log("✅ Issuance Success!");
        
        const total = await contract.totalIssued();
        console.log(`Total Issued: ${total}`);
    } catch (error) {
        console.error("❌ Transaction failed!");
        console.error(error.message);
    }
}

main().catch(console.error);
