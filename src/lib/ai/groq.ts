import { SIMPLIFIER_SYSTEM_PROMPT, SUPPORTED_LANGUAGES, SupportedLanguage } from './prompts';
import { getFallbackSimplification, SimplifiedNoticeResult } from './fallback';

export interface SimplifyNoticeResponse {
  data: SimplifiedNoticeResult;
  isFallback: boolean;
  model: string;
}

/**
 * Simplifies a dense legal notice text into plain language using Groq Llama 3.1 8B Instant.
 * Automatically falls back to static pre-written templates if GROQ_API_KEY is missing,
 * rate limited, or API call fails/times out.
 */
export async function simplifyNoticeText(
  legalText: string,
  targetLang: string = 'en'
): Promise<SimplifyNoticeResponse> {
  const langKey = (SUPPORTED_LANGUAGES[targetLang as SupportedLanguage] ? targetLang : 'en') as SupportedLanguage;
  const langName = SUPPORTED_LANGUAGES[langKey];

  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.log(`ℹ️ GROQ_API_KEY not set. Using static DPDP fallback template for [${langKey}]`);
    return {
      data: getFallbackSimplification(legalText, langKey),
      isFallback: true,
      model: 'static-template-fallback',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6-second timeout for hackathon demo speed

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SIMPLIFIER_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Target Language: ${langName} (${langKey})\n\nLegal Privacy Notice Text to simplify:\n"""${legalText}"""`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Groq API returned HTTP ${response.status}. Using fallback template.`);
      return {
        data: getFallbackSimplification(legalText, langKey),
        isFallback: true,
        model: 'groq-http-fallback',
      };
    }

    const result = await response.json();
    const contentString = result.choices?.[0]?.message?.content;

    if (!contentString) {
      throw new Error('Empty response from Groq API');
    }

    const parsedJson = JSON.parse(contentString);

    if (!parsedJson.simplified || !Array.isArray(parsedJson.keyPoints)) {
      throw new Error('Invalid JSON structure returned by Groq model');
    }

    return {
      data: {
        simplified: parsedJson.simplified,
        keyPoints: parsedJson.keyPoints,
        readingTime: parsedJson.readingTime || '30s',
      },
      isFallback: false,
      model: 'llama-3.1-8b-instant',
    };
  } catch (error: any) {
    console.warn(`Groq Llama 3.1 invocation error (${error.message}). Returning fallback template.`);
    return {
      data: getFallbackSimplification(legalText, langKey),
      isFallback: true,
      model: 'groq-error-fallback',
    };
  }
}
