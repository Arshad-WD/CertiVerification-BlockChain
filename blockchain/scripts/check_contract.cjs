const hre = require("hardhat");

async function main() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    console.log(`Checking address: ${address}`);

    const balance = await hre.ethers.provider.getBalance(address);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);

    const code = await hre.ethers.provider.getCode(address);
    console.log(`Bytecode length: ${code.length}`);
    
    if (code === "0x" || code === "0x0") {
        console.log("CRITICAL: No contract code found at this address!");
        // Check if there are other accounts
        const signers = await hre.ethers.getSigners();
        console.log(`First signer: ${signers[0].address}`);
        return;
    }

    try {
        const contract = await hre.ethers.getContractAt("CertificateVerifier", address);
        console.log("Attempting to call totalIssued()...");
        const total = await contract.totalIssued();
        console.log(`Success! Total Issued: ${total}`);
    } catch (error) {
        console.log("Call failed!");
        console.log(`Error Message: ${error.message}`);
        if (error.data) {
            console.log(`Error Data: ${error.data}`);
        }
        
        // Try a raw call
        try {
            console.log("Attempting raw static call to selector 0xf5be3193...");
            const rawResult = await hre.ethers.provider.call({
                to: address,
                data: "0xf5be3193"
            });
            console.log(`Raw call result: ${rawResult}`);
        } catch (rawError) {
            console.log(`Raw call failed: ${rawError.message}`);
        }
    }
}

main().catch(console.error);
