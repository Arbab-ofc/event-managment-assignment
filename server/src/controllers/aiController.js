const asyncHandler = require("../utils/asyncHandler");

const sanitizeDescription = (text) => {
  const withoutSymbols = text
    .replace(/[@#$*]/g, "")
    .replace(/_/g, " ")
    .replace(/[^\w\s.,'"-]/g, " ");
  return withoutSymbols.replace(/\s+/g, " ").trim();
};

const limitWords = (text, maxWords) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ").trim();
};

const limitChars = (text, maxChars) => {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim();
};

const enhanceDescription = asyncHandler(async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ success: false, message: "AI feature not configured" });
  }

  const { title, notes } = req.body;
  if (!title || !notes) {
    return res
      .status(400)
      .json({ success: false, message: "Title and notes are required" });
  }

  const isOpenRouter = apiKey.startsWith("sk-or-");
  const baseUrl = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
  const defaultModel = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
  const model = process.env.OPENAI_MODEL || defaultModel;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };

  if (isOpenRouter) {
    headers["HTTP-Referer"] = process.env.CLIENT_URL || "http://localhost:5173";
    headers["X-Title"] = "EventFlow";
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You write concise, polished event descriptions under 2000 words with no special symbols like @ # $ *."
        },
        {
          role: "user",
          content: `Event title: ${title}\nNotes: ${notes}\nWrite a polished event description.`
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return res
      .status(502)
      .json({ success: false, message: `AI request failed: ${errorText}` });
  }

  const data = await response.json();
  const rawDescription = data.choices?.[0]?.message?.content?.trim();
  const sanitized = rawDescription ? sanitizeDescription(rawDescription) : "";
  const wordLimited = limitWords(sanitized, 1999);
  const description = limitChars(wordLimited, 2000);

  if (!description) {
    return res.status(502).json({ success: false, message: "AI response invalid" });
  }

  return res.status(200).json({ success: true, description });
});

module.exports = { enhanceDescription };
