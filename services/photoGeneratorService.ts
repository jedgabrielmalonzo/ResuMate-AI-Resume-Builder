import Constants from 'expo-constants';
import * as FileSystemLegacy from 'expo-file-system/legacy';

type FormalPhotoSize = '1x1' | '2x2';

const GEMINI_API_KEY =
  Constants.expoConfig?.extra?.geminiApiKey ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  '';

// M O D E L S
const IMAGE_MODELS = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
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

  let lastError: unknown;
  for (const model of IMAGE_MODELS) {
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

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to generate formal photo.');
}
