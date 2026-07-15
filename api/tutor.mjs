export default async function handler(req, res) {
  // =========================
  // ALLOW ONLY POST
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      result: "Method not allowed",
    });
  }

  try {
    // =========================
    // GET DATA
    // =========================
    const {
      topic,
      history = [],
      fileText = "",
      model = "openai/gpt-4.1-mini",
    } = req.body;

    // =========================
    // EMPTY MESSAGE CHECK
    // =========================
    if (!topic || !topic.trim()) {
      return res.status(400).json({
        result: "Message is required",
      });
    }

    // =========================
    // SYSTEM PROMPT
    // =========================
    const systemPrompt = `
You are AskAi.

A smart, friendly and natural AI companion created by Govind Vaishnav.

Rules:

- Talk naturally like a real person.
- Be friendly and professional.
- Explain concepts in simple language.
- Help with studies, coding, writing and daily questions.
- If an uploaded document exists, use it first.
- Format answers neatly.
- Use Markdown when helpful.
`;

    // =========================
    // FILE CONTEXT
    // =========================
    const fileContext = fileText
      ? `
Uploaded Document:

${fileText.slice(0, 12000)}

Answer using this document whenever it is relevant.
`
      : "";

    // =========================
    // OPENROUTER REQUEST
    // =========================
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ask-ai-phi-nine.vercel.app",
          "X-Title": "AskAi",
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: systemPrompt + fileContext,
            },
            ...history,
            {
              role: "user",
              content: topic,
            },
          ],
        }),
      }
    );

    // =========================
    // GET RESPONSE
    // =========================
    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        result:
          data?.error?.message ||
          "OpenRouter request failed.",
      });
    }

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({
        result: "No response received from AI.",
      });
    }

    // =========================
    // SUCCESS
    // =========================
    return res.status(200).json({
      result: data.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      result: error.message || "Internal server error.",
    });
  }
}
