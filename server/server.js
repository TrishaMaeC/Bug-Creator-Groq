import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

app.post("/api/generate-bug", async (req, res) => {
  try {
    const { feature } = req.body;

    if (!feature || !feature.trim()) {
      return res.status(400).json({ error: "Feature is required." });
    }

    const prompt = `
You are a QA engineer. Generate a detailed bug report for the feature: "${feature}".
Include:
- Bug Title
- Description
- Steps to Reproduce
- Expected Result
- Actual Result
- Severity
`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    const bugReport = response.choices[0]?.message?.content || "No bug found.";
    res.json({ bugReport });
  } catch (error) {
    console.error("❌ Error generating bug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));