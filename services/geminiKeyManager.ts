import Constants from 'expo-constants';

// Get keys safely handling undefined
const primaryKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const key2 = process.env.EXPO_PUBLIC_GEMINI_API_KEY_2 || '';
const key3 = process.env.EXPO_PUBLIC_GEMINI_API_KEY_3 || '';
const key4 = process.env.EXPO_PUBLIC_GEMINI_API_KEY_4 || '';

// Load all non-empty keys into our array
const ALL_KEYS = [primaryKey, key2, key3, key4].filter((k) => k.trim().length > 0);

// Maintain the state of which key we are using right now
let currentKeyIndex = 0;

/**
 * Returns the currently active Gemini API key.
 */
export function getGeminiKey(): string {
  if (ALL_KEYS.length === 0) return '';
  return ALL_KEYS[currentKeyIndex % ALL_KEYS.length];
}

/**
 * Advances the active key index by one, wrapping around if necessary.
 */
export function advanceGeminiKey() {
  if (ALL_KEYS.length > 0) {
    currentKeyIndex = (currentKeyIndex + 1) % ALL_KEYS.length;
    console.log(`[GeminiKeyManager] Key rotated, now using key index ${currentKeyIndex}`);
  }
}

/**
 * A robust wrapper around fetch() that specifically handles Gemini 429 Quota/Rate Limit
 * by automatically switching to the next available API key and retrying the request.
 */
export async function fetchWithGeminiFallback(url: string, options: any, maxRetries = ALL_KEYS.length) {
  let lastError = null;
  let retries = 0;

  // We rotate up to `maxRetries` times before completely failing
  while (retries <= maxRetries && ALL_KEYS.length > 0) {
    const key = getGeminiKey();

    // Ensure the header explicitly uses the rotated key
    const newOptions = { ...options };
    newOptions.headers = { 
        ...newOptions.headers, 
        'x-goog-api-key': key 
    };

    try {
      const response = await fetch(url, newOptions);

      // Status 429 = Too Many Requests / Quota Exceeded
      // Status 403 = Forbidden / API key issues or Quota exceeded
      if (response.status === 429 || response.status === 403) {
        const errorText = await response.text();
        lastError = new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        console.warn(`[GeminiKeyManager] Hit rate limit on key ${currentKeyIndex}. Rotating...`);
        advanceGeminiKey();
        retries++;
        continue; // Try with the new key in the next loop
      }

      if (!response.ok) {
        // Just a generic error (e.g. 400 Bad Request) that is unrelated to quota
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      // If we are here, the response was successful! (status 200 OK)
      return response;

    } catch (error: any) {
      // If it's our own thrown generic error from above, bubble it up.
      if (error && error.message && error.message.includes('Gemini API error')) {
         throw error;
      }
      
      // If it's a fetch network error, wait briefly to see if connection recovers
      console.warn(`[GeminiKeyManager] Network error:`, error);
      lastError = error;
      
      // Let's not rotate just for standard network failures, but we might retry
      retries++;
      // Wait half a second before retrying a soft network error
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  throw lastError || new Error("All Gemini API keys exhausted or network failed.");
}
