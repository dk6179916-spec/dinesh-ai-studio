export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, style, size } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured"
    });
  }

  const fullPrompt = style
    ? `${prompt}. Style: ${style}.`
    : prompt;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: fullPrompt,
          size: size || "1024x1024"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI image generation failed"
      });
    }

    const image = data.data?.[0]?.b64_json;

    if (!image) {
      return res.status(500).json({
        error: "No image was returned"
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${image}`
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}