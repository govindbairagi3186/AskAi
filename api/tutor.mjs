export default async function handler(req, res) {

  // ALLOW ONLY POST
  if (req.method !== "POST") {

    return res.status(405).json({
      result: "Method not allowed"
    });

  }

  try {

    // GET DATA
    const {
  topic,
  history,
  fileText
} = req.body;

    // CHECK EMPTY MESSAGE
    if (!topic) {

      return res.status(400).json({
        result: "Message is required"
      });

    }

    // OPENROUTER REQUEST
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
            "openai/gpt-3.5-turbo",

          messages: [

            {

              role: "system",

              content:
"You are AskAi, a friendly neighbourhood AI friend created by Govind Vaishnav. Talk naturally like a helpful smart friend. Keep responses conversational, warm, simple and human-like."

            },

            ...history,

            {

              role: "user",

              content: topic

            }

          ]

        })

      }

    );

    // GET RESPONSE
    const data = await response.json();

    console.log(data);

    // HANDLE API ERROR
    if (data.error) {

      return res.status(500).json({

        result:
          data.error.message ||
          "OpenRouter API Error"

      });

    }

    // SEND AI MESSAGE
    return res.status(200).json({

      result:

        data.choices?.[0]?.message?.content ||

        "No response from AI."

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      result:
        "Server error occurred."

    });

  }

}
