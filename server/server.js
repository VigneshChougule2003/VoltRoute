// server/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/proxy", async (req, res) => {
  const { target } = req.query;
  if (!target) return res.status(400).send("Missing target URL");

  try {
    const decodedUrl = decodeURIComponent(target);
    const response = await fetch(decodedUrl);
    const data = await response.json(); // Fails if response is HTML
    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`🔌 Proxy server running at http://localhost:${PORT}`);
});
