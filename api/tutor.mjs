export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      result: "Method not allowed"
    });
  }

  try {

    const {
      topic,
      history,
      model
    } = req.body;

    const MODELS = {

      mistral:
        "openai/gpt-3.5-turbo",

      deepseek:
        "deepseek/deepseek-chat",

      llama:
        "meta-llama/llama-3-8b-instruct"

    };

    const selectedModel =
      MODELS[model] ||
      MODELS.mistral;

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {

            Authorization:
              `Bearer ${process.env.OPENROUTER_API_KEY}`,

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            model: selectedModel,

            messages: [

              {
                role: "system",
                content:
                  "You are AskAi, a premium AI assistant created by Govind Vaishnav."
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

    const data =
      await response.json();

    if (data.error) {

      return res.status(500).json({
        result:
          data.error.message
      });

    }

    return res.status(200).json({

      result:
        data.choices?.[0]?.message?.content ||
        "No response"

    });

  } catch (error) {

    return res.status(500).json({

      result:
        error.message

    });

  }

}
