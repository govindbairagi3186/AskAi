export default async function handler(req, res) {

  // ONLY POST
  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }

  try {

    const {

      topic,
      history,
      model

    } = req.body;

    // =========================
    // MODEL SWITCHING
    // =========================
    let selectedModel =
      const MODELS = {

  mistral:
    "openai/gpt-3.5-turbo",

  deepseek:
    "deepseek/deepseek-chat",

  llama:
    "meta-llama/llama-3-8b-instruct"

};

    if (model === "deepseek") {

      selectedModel =
        "deepseek/deepseek-r1";

    }

    if (model === "llama") {

      selectedModel =
        "meta-llama/llama-3.1-8b-instruct";

    }

    // =========================
    // SYSTEM PROMPT
    // =========================
    const messages = [

      {

        role: "system",

        content: `

You are AskAi.

A premium AI assistant created by GOVIND VAISHNAV.

Your personality:
- Helpful
- Smart
- Friendly
- Modern
- Clear
- Professional

Response Rules:
- Use markdown formatting
- Explain clearly
- Give examples when needed
- Make answers visually beautiful
- Use headings and bullets
- Give coding help properly
- Be accurate
- Sound like ChatGPT/Gemini

`

      },

      // CHAT HISTORY
      ...(history || []),

      // CURRENT MESSAGE
      {

        role: "user",

        content: topic

      }

    ];

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

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          model:
MODELS[selectedModel] || MODELS.mistral,

          messages,

          temperature: 0.7,

          max_tokens: 1200

        })

      }

    );

    const data =
      await response.json();

    // =========================
    // API ERROR
    // =========================
    if (data.error) {

      return res.status(500).json({

        error:
          data.error.message ||
          "OpenRouter Error"

      });

    }

    // =========================
    // SUCCESS
    // =========================
    const result =

      data.choices?.[0]?.message?.content ||

      "No response generated.";

    return res.status(200).json({

      result

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      error:
        "Server error occurred."

    });

  }

}
