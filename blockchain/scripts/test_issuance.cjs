async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [owner] = await ethers.getSigners();
  
  const CertificateVerifier = await ethers.getContractAt("CertificateVerifier", address);
  
  console.log("Testing issuance flow...");
  const contentHash = ethers.id("Test Certificate " + Date.now());
  
  try {
    const tx = await CertificateVerifier.issueCertificate(
        contentHash,
        "Test User",
        "Blockchain Developer",
        "QmMockTestCID"
    );
    await tx.wait();
    console.log("✅ Issuance successful!");
    
    const issued = await CertificateVerifier.totalIssued();
    console.log("Total Issued: " + issued);
  } catch (err) {
    console.log("❌ Error during issuance or metrics check: " + err.message);
  }
}

main().catch(console.error);
