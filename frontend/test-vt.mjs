const VT_KEY = "3c218a47bf274b58534ceeb3f2e5fb785eaecdbd1f44bc178beeeb53aefb8d1d";
fetch("https://www.virustotal.com/api/v3/files", {
  method: "POST",
  headers: { "x-apikey": VT_KEY },
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
