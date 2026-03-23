import Constants from 'expo-constants';
import * as FileSystemLegacy from 'expo-file-system/legacy';

type FormalPhotoSize = '1x1' | '2x2';

type GeminiModelInfo = {
  name?: string;
  supportedGenerationMethods?: string[];
};

const GEMINI_API_KEY =
  Constants.expoConfig?.extra?.geminiApiKey ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  '';

const IMAGE_MODELS_FALLBACK = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
];

function getMimeTypeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function buildPrompt(size: FormalPhotoSize): string {
  const sizeHint =
    size === '2x2'
      ? 'Output should be suitable for a 2x2-inch formal portrait crop.'
      : 'Output should be suitable for a 1x1-inch formal portrait crop.';

  return [
    'Edit this uploaded photo into a professional formal resume headshot.',
    'Strictly keep the same person identity and facial features.',
    'Improve lighting naturally, keep skin tones realistic, and clean up distractions.',
    'Use a neutral clean background and professional attire look.',
    'Frame as a centered head-and-shoulders portrait.',
    sizeHint,
    'Return an image output only.',
  ].join(' ');
}

function extractImagePart(data: any): { mimeType: string; base64Data: string } | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    const inlineData = part?.inlineData || part?.inline_data;
    if (inlineData?.data) {
      return {
        mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png',
        base64Data: inlineData.data,
      };
    }
  }

  return null;
}

async function callImageModel(model: string, prompt: string, base64Image: string, mimeType: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini image error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function getAvailableModelNames(): Promise<string[]> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    method: 'GET',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const models: GeminiModelInfo[] = Array.isArray(payload?.models) ? payload.models : [];

  return models
    .filter((model) =>
      Array.isArray(model.supportedGenerationMethods) &&
      model.supportedGenerationMethods.includes('generateContent')
    )
    .map((model) => (model.name || '').replace(/^models\//, ''))
    .filter(Boolean);
}

function buildCandidateModelList(available: string[]): string[] {
  const normalized = available.filter((name) => {
    const lower = name.toLowerCase();
    return (
      lower.includes('gemini') &&
      !lower.includes('embedding') &&
      !lower.includes('aqa')
    );
  });

  // If ListModels returned data, trust it and avoid stale hardcoded names.
  if (normalized.length > 0) {
    const preferred = normalized.filter((name) => {
      const lower = name.toLowerCase();
      return lower.includes('image') || lower.includes('vision');
    });

    const flash = normalized.filter((name) => {
      const lower = name.toLowerCase();
      return lower.includes('flash');
    });

    // Deduplicate while preserving order.
    return Array.from(new Set([...preferred, ...flash, ...normalized]));
  }

  // Fallback only when model discovery is unavailable.
  return IMAGE_MODELS_FALLBACK;
}

export async function generateFormalPhoto(
  sourceImageUri: string,
  size: FormalPhotoSize
): Promise<{ dataUri: string; mimeType: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key. Set EXPO_PUBLIC_GEMINI_API_KEY in your environment.');
  }

  const base64Image = await FileSystemLegacy.readAsStringAsync(sourceImageUri, {
    encoding: FileSystemLegacy.EncodingType.Base64,
  });

  const mimeType = getMimeTypeFromUri(sourceImageUri);
  const prompt = buildPrompt(size);
  const availableModels = await getAvailableModelNames();
  const candidateModels = buildCandidateModelList(availableModels);

  let lastError: unknown;
  for (const model of candidateModels) {
    try {
      const data = await callImageModel(model, prompt, base64Image, mimeType);
      const imagePart = extractImagePart(data);
      if (!imagePart) {
        throw new Error('No image was returned by the model.');
      }

      return {
        dataUri: `data:${imagePart.mimeType};base64,${imagePart.base64Data}`,
        mimeType: imagePart.mimeType,
      };
    } catch (error) {
      lastError = error;
    }
  }

  const fallbackMessage =
    'Image generation is not available for the current Gemini API key/project. ' +
    'Your key appears to have text-capable models only, or image generation is not enabled. ' +
    'Enable an image-capable Gemini model, then try again.';

  if (lastError instanceof Error) {
    throw new Error(`${lastError.message}\n\n${fallbackMessage}`);
  }

  throw new Error(fallbackMessage);
}
