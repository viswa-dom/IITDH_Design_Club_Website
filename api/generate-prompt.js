// api/generate-prompt.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { seed, style } = req.body;

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    console.log('Generating prompt with seed:', seed, 'style:', style);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 50,
        temperature: 1.35,
        top_p: 0.9,
        messages: [
          {
            role: "user",
            content: `
Seed: ${seed}
Directive: ${style}

Generate ONE design challenge.

Rules:
- Under 12 words
- No logos, posters, brands, typography
- Avoid symmetry, minimalism, balance clichés
- Must feel unlike typical design prompts
- Output ONLY the prompt text
`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const prompt = data?.content?.[0]?.text?.trim();

    if (!prompt) {
      throw new Error("Empty response from API");
    }

    console.log('Generated prompt:', prompt);

    return res.status(200).json({ 
      success: true,
      prompt: prompt 
    });

  } catch (error) {
    console.error('Generate prompt error:', error);
    
    // Return fallback prompts on error
    const fallbacks = [
      "Design certainty using only ambiguity",
      "Create order without repetition",
      "Communicate motion in a static medium",
      "Design warmth without color",
      "Express scale using identical elements",
      "Build hierarchy without size differences",
      "Show depth in two dimensions",
      "Create rhythm without pattern",
      "Express speed without direction",
      "Design silence visually"
    ];

    const fallbackPrompt = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return res.status(200).json({ 
      success: true,
      prompt: fallbackPrompt,
      isFallback: true 
    });
  }
}