export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {

      return res.status(405).json({
        result: "Method not allowed"
      });

    }

    const { topic, history } = req.body;

    const systemPrompt = `
You are AskAi, a modern AI assistant like ChatGPT.

Rules:

- Answer naturally like ChatGPT
- Give detailed helpful responses
- Use proper formatting
- Use headings when needed
- Use bullet points
- Explain deeply but clearly
- Avoid giant boring paragraphs
- Make answers beautiful and engaging
- For coding → give examples
- For study → explain step-by-step
- For casual chat → talk naturally
- Behave like a real AI assistant

Example style:

🐍 What is Python?

Python is a powerful programming language used for:

- Web Development
- AI & Machine Learning
- Automation
- Data Science

Example:
\`\`\`python
print("Hello World")
\`\`\`

Python is beginner-friendly and widely used.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          model: "deepseek/deepseek-chat:free",

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

          ]

        })

      }
    );

    const data = await response.json();

    console.log(data);

    if (!data.choices) {

      return res.status(500).json({

        result:
          "❌ AI Error. Check API key or model."

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
