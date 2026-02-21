import { ethers } from "ethers";
import contractABI from "./CertificateVerifier.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signerOrProvider);
}

export async function getIssuerRole(address: string, provider: ethers.Provider) {
    const contract = await getContract(provider);
    return await contract.authorizedIssuers(address);
}

export async function verifyCertificateHash(hash: string, provider: ethers.Provider) {
    const contract = await getContract(provider);
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
