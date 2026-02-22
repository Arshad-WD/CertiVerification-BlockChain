import { ethers } from "ethers";
import contractABI from "./CertificateVerifier.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const EXPECTED_CHAIN_ID = "31337";

export function getPublicProvider() {
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signerOrProvider);
}

export function getPublicContract() {
    return getContract(getPublicProvider());
}

/**
 * Verifies if the contract at the configured address matches the local ABI.
 * Returns 'OK', 'MISSING', or 'MISMATCH'
 */
export async function checkContractSync() {
    try {
        const provider = getPublicProvider();
        const code = await provider.getCode(CONTRACT_ADDRESS);

        if (code === "0x" || code === "0x0") return "MISSING";

        // Simple heuristic: compare length to detect major version mismatches
        const expectedCode = contractABI.deployedBytecode;
        if (Math.abs(code.length - expectedCode.length) > 500) return "MISMATCH";

        return "OK";
    } catch (e) {
        return "OFFLINE";
    }
}

export async function getIssuerRole(address: string, provider?: ethers.Provider) {
    const contract = provider ? getContract(provider) : getPublicContract();
    return await contract.authorizedIssuers(address);
}

export async function verifyCertificateHash(hash: string, provider?: ethers.Provider) {
    const contract = provider ? getContract(provider) : getPublicContract();
    const [exists, valid, issuer, timestamp] = await contract.verifyCertificate(hash);
    return { exists, valid, issuer, timestamp: Number(timestamp) };
}

export function generateCertificateHash(content: string) {
    return ethers.id(content);
}

export async function computeFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);
            const hash = ethers.keccak256(bytes);
            resolve(hash);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
