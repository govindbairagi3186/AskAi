export default async function handler(req, res) {

  // Allow only POST
  if (req.method !== "POST") {

    return res.status(405).json({
      result: "Method not allowed"
    });

  }

  try {

    const { topic, history } = req.body;

    // =========================
    // SYSTEM PROMPT
    // =========================

    const systemPrompt = `
You are AskAi, a smart AI assistant like ChatGPT.

Rules:
- Answer naturally
- Be helpful
- Give complete answers
- Use bullet points
- Use examples
- Explain clearly
- Avoid giant boring paragraphs
- Behave like ChatGPT
`;

    // =========================
    // API REQUEST
    // =========================

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Authorization":
            "Bearer " + process.env.OPENROUTER_API_KEY,

          "Content-Type": "application/json",

          "HTTP-Referer":
            "https://ask-ai-phi-nine.vercel.app",

          "X-Title":
            "AskAi"

        },

        body: JSON.stringify({

          model:
            "deepseek/deepseek-chat-v3-0324:free",

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
    // CONVERT RESPONSE
    // =========================

    const data = await response.json();

    console.log(data);

    // =========================
    // ERROR CHECK
    // =========================

    if (data.error) {

      return res.status(500).json({

        result:
          "❌ OpenRouter Error:\n" +
          data.error.message

      });

    }

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      result:
        data.choices?.[0]?.message?.content
        || "No response."

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      result:
        "❌ Server Error:\n" + error.message

    });

  }

}
