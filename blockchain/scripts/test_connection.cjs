const hre = require("hardhat");

async function main() {
    try {
        const accounts = await hre.ethers.provider.listAccounts();
        console.log("Connected to Hardhat node!");
        console.log(`Available accounts: ${accounts.length}`);
        console.log(`First account: ${accounts[0].address}`);
        
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);
    } catch (error) {
        console.error("Failed to connect to Hardhat node!");
        console.error(error.message);
    }
}

main().catch(console.error);
