async function main() {
  const [deployer] = await ethers.getSigners();
  const CertificateVerifier = await ethers.getContractFactory("CertificateVerifier");
  const contract = await CertificateVerifier.deploy({ gasLimit: 5000000 });
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("DEPLOYED_ADDRESS:" + address);
  
  const isIssuer = await contract.authorizedIssuers(deployer.address);
  console.log("IS_ISSUER:" + isIssuer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
