async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const user = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  
  const code = await ethers.provider.getCode(address);
  console.log("CODE_LENGTH:" + code.length);
  
  if (code.length > 2) {
    const CertificateVerifier = await ethers.getContractAt("CertificateVerifier", address);
    try {
      const isIssuer = await CertificateVerifier.authorizedIssuers(user);
      console.log("IS_ISSUER:" + isIssuer);
      const owner = await CertificateVerifier.owner();
      console.log("OWNER:" + owner);
      try {
        const totalIssued = await CertificateVerifier.totalIssued();
        console.log("TOTAL_ISSUED:" + totalIssued);
        const totalRevoked = await CertificateVerifier.totalRevoked();
        console.log("TOTAL_REVOKED:" + totalRevoked);
      } catch (err) {
        console.log("METRICS_NOT_FOUND: Update contract and redeploy.");
      }
    } catch (e) {
      console.log("CONTRACT_CALL_FAILED:" + e.message);
    }
  } else {
    console.log("NO_CONTRACT_AT_ADDRESS");
  }
}

main().catch(console.error);
