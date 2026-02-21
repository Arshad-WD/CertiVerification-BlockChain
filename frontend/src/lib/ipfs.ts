export async function uploadToIPFS(file: File) {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (!PINATA_JWT) {
        console.warn("Pinata JWT not found. Mocking upload...");
        // Mock upload for development
        return {
            success: true,
            cid: "QmMockHash" + Math.random().toString(36).substring(7),
            url: URL.createObjectURL(file)
        };
    }

    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
        name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: formData,
        });
        const resData = await res.json();
        return {
            success: true,
            cid: resData.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
        };
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        return { success: false, error };
    }
}
