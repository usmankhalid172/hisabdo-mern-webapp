export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Job description is required.'
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error: 'Groq API key is not configured.'
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
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a job post parser. Return only valid JSON. No markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1
    })
  }
);

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);

      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini API request failed.'
      });
    }

    const raw =
  data?.choices?.[0]?.message?.content || '';

    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.status(500).json({
        error: 'Gemini returned an invalid response.'
      });
    }

    const result = JSON.parse(match[0]);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Smart Fill error:', error);

    return res.status(500).json({
      error: error.message || 'Internal server error.'
    });
  }
}