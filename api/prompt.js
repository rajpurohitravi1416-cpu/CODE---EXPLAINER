export default async function handler(req, res) {
  const { input } = req.body;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate code from this prompt"
        },
        {
          role: "user",
          content: input
        }
      ]
    })
  });

  const data = await response.json();

  res.json({
    result: data.choices?.[0]?.message?.content
  });
}