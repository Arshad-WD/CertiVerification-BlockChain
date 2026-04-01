# Blockchain Certificate Verification Project

This project implements a secure, blockchain-based system for issuing and verifying academic certificates.

## VirusTotal Integration

We use a high-security, institutional-grade scanning flow to ensure all certificates are free from malware before they are permanently recorded on the blockchain.

## Testing VirusTotal Integration

**Test clean file:**
Upload any small .pdf or .txt file. Should reach SAFE state and display the keccak256 hash.

**Test malware detection (EICAR):**
Run in terminal to create a safe, detectable test file:
  `echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt`
Upload `eicar.txt`. Should reach UNSAFE state and block issuance. This file is harmless.

**Test API key directly:**
  `curl -X POST https://www.virustotal.com/api/v3/files -H "x-apikey: YOUR_KEY" -F "file=@eicar.txt"`
Expected: 200 response with an `analysis_id` field.

**Rate limit:** Free VirusTotal tier = 4 requests/minute. If you hit 429, wait 60 seconds.

## Running the Project

1. **Blockchain**:
   ```bash
   cd blockchain
   npm install
   npm run node
   npm run deploy
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
