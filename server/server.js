// server/server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/openchargemap", async (req, res) => {
  const { latitude, longitude, distance, maxresults } = req.query;

  const apiUrl = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&latitude=${latitude}&longitude=${longitude}&distance=${distance}&maxresults=${maxresults}&key=API_KEY`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching OpenChargeMap data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`🔌 Proxy server running at http://localhost:${PORT}`);
});
