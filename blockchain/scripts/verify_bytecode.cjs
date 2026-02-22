async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const code = await ethers.provider.getCode(address);
  console.log("ADDRESS: " + address);
  console.log("LENGTH: " + code.length);
  
  if (code.length < 3) {
    console.log("ERROR: NO_CODE_AT_ADDRESS");
    return;
  }

  // Common function selectors
  const selectors = {
    "authorizedIssuers(address)": "0x20694db0",
    "owner()": "0x8da5cb5b",
    "totalIssued()": "0xf5be3193",
    "totalRevoked()": "0xf731fa0f"
  };

  for (const [name, selector] of Object.entries(selectors)) {
    const rawSelector = selector.slice(2);
    const index = code.indexOf(rawSelector);
    console.log(`${name} (${selector}): ${index !== -1 ? "FOUND" : "NOT_FOUND"}`);
    
    // Attempting a direct call to be absolutely sure
    try {
        const result = await ethers.provider.call({
            to: address,
            data: selector
        });
        console.log(`CALL ${name}: SUCCESS, result: ${result}`);
    } catch (e) {
        console.log(`CALL ${name}: FAILED, error: ${e.message.split('\n')[0]}`);
    }
  }
}

main().catch(console.error);
