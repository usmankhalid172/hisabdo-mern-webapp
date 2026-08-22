const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ error: "Job description text is required." });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Mock parsing fallback if API key is not configured
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const title = lines[0] || "Software Engineer";
      return res.json({
        title,
        department: "Engineering",
        employmentType: "Full-time",
        location: "Lahore, Pakistan / Remote",
        workplaceType: "On-site",
        experience: "1-3 years",
        salary: "Negotiable",
        openings: "1",
        description: text.slice(0, 300),
        responsibilities: lines.slice(1, 4),
        requirements: lines.slice(4, 7),
        skills: ["JavaScript", "Node.js", "MongoDB"],
        applicationUrl: "",
        applicationEmail: "careers@hisabdo.app",
        applicationPhone: "",
      });
    }

    const prompt = `Extract job posting details from the text below and return ONLY a valid JSON object with these exact keys.

{
  "title": "",
  "department": "",
  "employmentType": "",
  "location": "",
  "workplaceType": "",
  "experience": "",
  "salary": "",
  "openings": "",
  "description": "",
  "responsibilities": [],
  "requirements": [],
  "skills": [],
  "applicationUrl": "",
  "applicationEmail": "",
  "applicationPhone": ""
}

Rules:
- Return ONLY JSON.
- Use empty string if a value is not found.
- responsibilities, requirements and skills must always be arrays.
- Do not invent information.

Job posting:
${text}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a job post parser. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data?.error?.message || "AI request failed" });
    }

    const raw = data?.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return res
        .status(500)
        .json({ error: "AI returned invalid response format" });
    }

    const result = JSON.parse(match[0]);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
