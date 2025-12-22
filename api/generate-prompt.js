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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log('=== DEBUG INFO ===');
    console.log('1. API Key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('ERROR: ANTHROPIC_API_KEY is not set!');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')));
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    console.log('2. API Key prefix:', apiKey.substring(0, 10) + '...');
    console.log('3. API Key length:', apiKey.length);
    console.log('4. Seed:', seed);
    console.log('5. Style:', style);

    const requestBody = {
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
    };

    console.log('6. Making request to Anthropic API...');
    console.log('7. Request model:', requestBody.model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('8. Response received');
    console.log('9. Response status:', response.status);
    console.log('10. Response statusText:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('11. ERROR RESPONSE:');
      console.error('    Status:', response.status);
      console.error('    Body:', errorText);
      
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
        console.error('    Parsed error:', JSON.stringify(parsedError, null, 2));
      } catch (e) {
        console.error('    Could not parse error as JSON');
      }
      
      throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('12. Success! Response data:', JSON.stringify(data, null, 2));
    
    const prompt = data?.content?.[0]?.text?.trim();
    console.log('13. Extracted prompt:', prompt);

    if (!prompt) {
      console.error('14. ERROR: Prompt is empty!');
      console.error('    Full response:', JSON.stringify(data, null, 2));
      throw new Error("Empty response from API");
    }

    console.log('15. SUCCESS! Returning prompt');
    console.log('=== END DEBUG ===');

    return res.status(200).json({ 
      success: true,
      prompt: prompt,
      isFallback: false
    });

  } catch (error) {
    console.error('=== ERROR CAUGHT ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    
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

    console.log('USING FALLBACK:', fallbackPrompt);

    return res.status(200).json({ 
      success: true,
      prompt: fallbackPrompt,
      isFallback: true,
      error: error.message // Include error for debugging
    });
  }
}