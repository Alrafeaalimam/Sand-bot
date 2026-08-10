require("dotenv").config();
const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const conversation = require("./src/conversation");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// نديه session id جديد لكل زائر
app.get("/api/session", (req, res) => {
  res.json({ sessionId: uuidv4() });
});

app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) {
    return res.status(400).json({ error: "sessionId و message مطلوبين" });
  }
  try {
    const reply = await conversation.handleMessage(sessionId, message.trim());
    res.json({ reply });
  } catch (err) {
    console.error("خطأ في /api/chat:", err);
    res.status(500).json({ error: "صار خطأ في السيرفر" });
  }
});

const PORT = process.env.PORT || process.env.WEB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 واجهة سند بوت شغالة على http://localhost:${PORT}`);
});
