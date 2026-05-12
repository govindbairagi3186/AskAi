export default async function handler(req, res) {

try {

```
if (req.method !== "POST") {
  return res.status(405).json({
    result: "Method not allowed"
  });
}

const { topic, history } = req.body;

const response = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat:free",
      messages: [
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

return res.status(200).json({
  result:
    data?.choices?.[0]?.message?.content ||
    "No response from AI."
});
```

} catch (error) {

```
return res.status(500).json({
  result: error.message
});
```

}
}
