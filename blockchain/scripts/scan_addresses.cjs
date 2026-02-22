async function main() {
  const addresses = [
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  ];
  const [owner] = await ethers.getSigners();
  
  for (const addr of addresses) {
    const code = await ethers.provider.getCode(addr);
    console.log(`\n--- Address: ${addr} ---`);
    console.log(`Length: ${code.length}`);
    if (code.length > 2) {
      const contract = await ethers.getContractAt("CertificateVerifier", addr);
      try {
        const ownerAddr = await contract.owner();
        console.log(`Owner: ${ownerAddr}`);
        const total = await contract.totalIssued();
        console.log(`Total Issued: ${total}`);
        console.log(`✅ METRICS FOUND!`);
      } catch (e) {
        console.log(`❌ Metrics check failed: ${e.message.split('\n')[0]}`);
      }
    } else {
      console.log("Empty address.");
    }
  }
}

main().catch(console.error);
