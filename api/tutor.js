export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        result: "Method not allowed"
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const { topic, history } = body;

    // =========================
    // SYSTEM PROMPT
    // =========================

    const systemPrompt = `
You are AskAi, a modern AI assistant like ChatGPT.

Rules:
- Give detailed answers
- Explain clearly
- Use headings and bullet points
- Avoid huge boring paragraphs
- Respond naturally
- Be smart and conversational
- Help in studies, coding, life, ideas, writing, and normal chat
- Give examples whenever useful

Example Style:

🐍 Python is a beginner-friendly programming language.

It is used for:
- AI
- Websites
- Automation
- Apps

Example:
\`\`\`python
print("Hello World")
\`\`\`
`;

    // =========================
    // API CALL
    // =========================

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type": "application/json",

          "HTTP-Referer":
            "https://ask-ai-phi-nine.vercel.app",

          "X-Title":
            "AskAi"
        },

        body: JSON.stringify({

          model: "mistralai/mistral-7b-instruct:free",

          messages: [

            {
              role: "system",
              content: systemPrompt
            },

            ...(history || []),

            {
              role: "user",
              content: topic
            }

          ],

          temperature: 0.7,
          max_tokens: 1000

        })

      }
    );

    // =========================
    // RESPONSE
    // =========================

    const data = await response.json();

    console.log("OPENROUTER RESPONSE:", data);

    // =========================
    // ERROR CHECK
    // =========================

    if (!data.choices) {

      return res.status(500).json({

        result:
          "❌ API Error:\n" +
          JSON.stringify(data, null, 2)

      });

    }

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      result:
        data.choices[0].message.content

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      result:
        "❌ Server Error: " + error.message

    });

  }

}
