export default async function handler(req, res) {

  // =========================
  // ALLOW ONLY POST
  // =========================

  if (req.method !== "POST") {

    return res.status(405).json({
      result: "Method not allowed"
    });

  }

  try {

    // =========================
    // GET DATA
    // =========================

    const {
      topic,
      history = [],
      fileText = ""
    } = req.body;

    // =========================
    // EMPTY MESSAGE CHECK
    // =========================

    if (!topic) {

      return res.status(400).json({
        result: "Message is required"
      });

    }

    // =========================
    // SYSTEM PROMPT
    // =========================

    const systemPrompt = `

You are AskAi.

A smart, friendly and natural AI companion created by Govind Vaishnav.

Behavior Rules:

- Talk like a helpful neighbourhood friend.
- Be warm, conversational and human-like.
- Explain things simply.
- Help in studies, coding, writing and general questions.
- If uploaded file content exists, answer using that file.
- Keep responses clean and readable.
- Avoid robotic tone.

`;

    // =========================
    // FILE CONTEXT
    // =========================

    const fileContext = fileText
      ? `

Uploaded File Content:

${fileText.slice(0,12000)}

Use this uploaded file to answer the user's questions whenever relevant.

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

          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            "https://ask-ai-phi-nine.vercel.app",

          "X-Title":
            "AskAi"

        },

       body: JSON.stringify({

  model:
    req.body.model || "openai/gpt-4.1-mini",

  temperature: 0.7,

  max_tokens: 2000,

  messages: [

    {
      role: "system",
      content: systemPrompt + fileContext
    },

    ...history,

    {
      role: "user",
      content: topic
    }

  ]

})

            // SYSTEM
            {

              role: "system",

              content:
                systemPrompt + fileContext

            },

            // CHAT HISTORY
            ...history,

            // USER MESSAGE
            {

              role: "user",

              content: topic

            }

          ]

        })

      }

    );

    // =========================
    // GET AI RESPONSE
    // =========================

   const data = await response.json();

if (!response.ok) {

    console.error(data);

    return res.status(response.status).json({

        result:
        data?.error?.message ||
        "OpenRouter request failed."

    });

}

if (!data.choices || !data.choices.length) {

    return res.status(500).json({

        result:
        "No response received from the AI."

    });

}

    // =========================
    // SEND AI MESSAGE
    // =========================

    return res.status(200).json({

    result:
    data.choices[0].message.content.trim()

});

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      result:
        "Server error occurred."

    });

  }

}
