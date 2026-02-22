// Node.js 18+ has native fetch
async function testPinata() {
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZWY3MmE4OC00MTEwLTRlMjAtYTY2OC1mYWYxMjFkYTMwMWIiLCJlbWFpbCI6ImRhcmtqZW5peDc4NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMzdlMzdiODczMGE5MmRmZjA5MmYiLCJzY29wZWRLZXlTZWNyZXQiOiI0NGUwZGUwMDNkYWE5OWFiN2EwMjZjZWI5NGE5NTE4ODYxMjk5MjRlODgzMTEzZmJlYTlhNzcyMmY5MmM3ZjYyIiwiZXhwIjoxODAzMjgyODQ1fQ.N70dFpv4E1H06qHmGc2v3LMqpNJGuv_8q45GM-57mXk";

    console.log("Testing Pinata Authentication...");
    try {
        const res = await fetch("https://api.pinata.cloud/data/testAuthentication", {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${JWT}`
            }
        });
        const data = await res.json();
        console.log("Response Status:", res.status);
        if (res.status === 200) {
            console.log("✅ Pinata Authentication Successful!");
            console.log("User Email:", data.message);
        } else {
            console.log("❌ Authentication Failed.");
            console.log("Detail:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

testPinata();
