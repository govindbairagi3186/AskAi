
export default async function handler(req,res){

  try{

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const prompt = `
You are AskAi.

A modern AI assistant like ChatGPT.

User message:
"${topic}"

Rules:
- Respond naturally
- Be conversational
- Give detailed helpful answers
- Use markdown
- Use code blocks if needed
- Use bullet points when useful
- Add diagrams only if useful
- Never sound robotic
- Keep answers engaging and intelligent

You can help with:
- Study
- Coding
- Writing
- Ideas
- Research
- Productivity
- Life questions
- General chat
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:"POST",
        headers:{
          "Authorization":"Bearer " + process.env.OPENROUTER_API_KEY,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          model:"openai/gpt-3.5-turbo",
          messages:[
            ...(history || []),
            {
              role:"user",
              content:prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      result:data.choices?.[0]?.message?.content || "No response"
    });

}
