export async function uploadToIPFS(file: File) {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (!PINATA_JWT) {
        return {
            success: false,
            error: "IPFS Configuration Error: PINATA_JWT is missing. Please set it in your environment."
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

        if (!resData.IpfsHash) {
            throw new Error("Pinata response missing IpfsHash");
        }

        return {
            success: true,
            cid: resData.IpfsHash as string,
            url: `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`,
        };
    } catch (error: any) {
        console.error("Error uploading to IPFS:", error);
        return {
            success: false,
            error: error.message || "Unknown IPFS Error"
        };
    }
}
