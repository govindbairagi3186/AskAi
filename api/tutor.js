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

    const systemPrompt = `
You are AskAi, an advanced AI assistant like ChatGPT.

Rules:
- Give detailed and accurate answers
- Use clean formatting
- Use bullet points
- Explain step-by-step
- Avoid giant paragraphs
- Be conversational and smart
- Help in coding, studies, life, writing, business, AI, and normal chat
- Behave like a premium AI assistant
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {

          "Authorization":
            \`Bearer \${process.env.OPENROUTER_API_KEY}\`,

          "Content-Type": "application/json",

          "HTTP-Referer":
            "https://ask-ai-phi-nine.vercel.app",

          "X-Title":
            "AskAi"

        },

        body: JSON.stringify({

          model: "deepseek/deepseek-chat-v3-0324:free",

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
          max_tokens: 1200

        })

      }
    );

    const data = await response.json();

    console.log(data);

    if (!data.choices) {

      return res.status(500).json({

        result:
          "❌ API Error:\n" +
          JSON.stringify(data, null, 2)

      });

    }

    return res.status(200).json({

      result:
        data.choices[0].message.content

    });

  } catch (error) {

    return res.status(500).json({

      result:
        "❌ Server Error: " + error.message

    });

  }

}
