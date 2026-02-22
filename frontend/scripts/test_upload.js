const fs = require('fs');
const path = require('path');

async function testPinFile() {
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZWY3MmE4OC00MTEwLTRlMjAtYTY2OC1mYWYxMjFkYTMwMWIiLCJlbWFpbCI6ImRhcmtqZW5peDc4NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMmM3NDBmYmFkMTEyMWU2NWM2MTMiLCJzY29wZWRLZXlTZWNyZXQiOiI1ODEwOWMwMWM1YmYyYjFjMWJmYzAzMWI1MTViOWRiNTk5ZDEwZDE0YTNjNzhjMWE3YTFmZjU4ZTZkMWEwMzI5IiwiZXhwIjoxODAzMjg1ODY1fQ.r_fBJNFz3S_hG2pTV8g04OIg4iD8YCi7pHlJY5I2IDs";

    console.log("Testing Real File Upload to Pinata...");
    
    // Create a dummy file
    const filePath = path.join(__dirname, 'test_asset.txt');
    fs.writeFileSync(filePath, 'Diagnostic Pinata Upload - Verification ' + Date.now());

    try {
        const formData = new FormData();
        const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
        formData.append('file', blob, 'test_asset.txt');

        const metadata = JSON.stringify({ name: 'Diagnostic-Asset' });
        formData.append('pinataMetadata', metadata);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${JWT}`
            },
            body: formData
        });

        const data = await res.json();
        console.log("Upload Status:", res.status);
        if (res.status === 200) {
            console.log("✅ IPFS Upload Successful!");
            console.log("CID:", data.IpfsHash);
            console.log("Gateway Link: https://gateway.pinata.cloud/ipfs/" + data.IpfsHash);
        } else {
            console.log("❌ Upload Failed.");
            console.log("Detail:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch Error:", err.message);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testPinFile();
