export default async function handler(req, res) {

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const prompt = `
You are AskAi.

User message:
"${topic}"

Respond naturally like ChatGPT.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: [
            ...(history || []),
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {

    res.status(500).json({
      result: "Server Error: " + err.message
    });
  }
}
