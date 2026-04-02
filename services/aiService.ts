import { ResumeTemplate } from '@/components/resume/templates';
import { GeneratedResumeData } from '@/context/ResumeContext';
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

type TemplateRecommendation = {
  id: string;
  reason: string;
};

function normalizeRole(role: string): string {
  return role
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function ensureTargetRoleInResume(
  data: GeneratedResumeData,
  targetRoleRaw: string | undefined,
  template: ResumeTemplate
): GeneratedResumeData {
  const targetRole = (targetRoleRaw ?? '').trim();
  if (!targetRole) return data;

  const normalizedRole = normalizeRole(targetRole);
  const formalRoleLine = `Desired Position: ${normalizedRole}`;
  const sectionTitles = data.sections.map((s) => s.title.toLowerCase());

  // 1) Prefer writing into an existing "Target Role" section if present.
  const targetRoleIndex = data.sections.findIndex(
    (s) => s.title.toLowerCase() === 'target role'
  );
  if (targetRoleIndex >= 0) {
    const updated = [...data.sections];
    updated[targetRoleIndex] = {
      ...updated[targetRoleIndex],
      content: formalRoleLine,
    };
    return { ...data, sections: updated };
  }

  // 2) Otherwise prepend it to the most suitable summary/objective section.
  const preferredSectionTitles = [
    'career objective',
    'professional summary',
    'summary of qualifications',
    'objective',
    'profile',
  ];
  const preferredIndex = data.sections.findIndex((s) =>
    preferredSectionTitles.includes(s.title.toLowerCase())
  );

  if (preferredIndex >= 0) {
    const existing = data.sections[preferredIndex].content;
    const hasRoleAlready = existing.toLowerCase().includes(normalizedRole.toLowerCase());
    const updated = [...data.sections];
    updated[preferredIndex] = {
      ...updated[preferredIndex],
      content: hasRoleAlready ? existing : `${formalRoleLine}\n${existing}`.trim(),
    };
    return { ...data, sections: updated };
  }

  // 3) If no suitable section exists, insert a dedicated section near the top.
  const contactIdx = sectionTitles.findIndex((title) => title.includes('contact'));
  const insertAt = contactIdx >= 0 ? contactIdx + 1 : 0;
  const inserted = [...data.sections];
  inserted.splice(insertAt, 0, {
    title: 'Career Objective',
    content: formalRoleLine,
  });
  return { ...data, sections: inserted };
}

function getFormatInstructions(template: ResumeTemplate): string {
  switch (template.formatType) {
    case 'chronological':
      return [
        'Work Experience must be in reverse chronological order (most recent role first).',
        'Each experience should include role title, company, date range, and achievements.',
      ].join(' ');
    case 'functional':
      return [
        'Prioritize skills, strengths, and achievements over timeline details.',
        'Use grouped skill categories with evidence bullets for each group.',
      ].join(' ');
    default:
      return 'Write a clear, professional resume tailored to the selected format.';
  }
}

function countFilled(values: string[]): number {
  return values.filter((v) => v.trim().length > 0).length;
}

function getTemplateBaseReason(template: ResumeTemplate): string {
  switch (template.formatType) {
    case 'chronological':
      return 'Best when your strongest advantage is clear, steady career progression.';
    case 'functional':
      return 'Best when skills and achievements are stronger than long work history.';
    default:
      return 'A suitable format based on your profile.';
  }
}

import { fetchWithGeminiFallback } from './geminiKeyManager';

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetchWithGeminiFallback(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function generateResume(userData: any, template: ResumeTemplate): Promise<GeneratedResumeData> {
  const sections = template.sections.join(', ');
  const formatInstructions = getFormatInstructions(template);
  const lengthGuidance = 'Keep content concise but complete, suitable for a full professional resume.';

  const aiUserData = { ...userData };
  delete aiUserData.photoUri;

  const prompt = `You are a professional resume writer. Generate a complete, well-structured resume as a JSON object for the following person using the "${template.name}" template.

Template sections to include (in order): ${sections}
Template format type: ${template.formatType}
Format-specific writing rules: ${formatInstructions}

User Information:
${JSON.stringify(aiUserData, null, 2)}


Instructions:
- Return ONLY a valid JSON object, no explanation or extra text.
- The JSON must have this exact structure: { "sections": [ { "title": "Section Name", "content": "Section content as plain text" } ] }
- Each section title must match one of the template sections.
- Content should be professional, concise, and suitable for an undergraduate or college graduate.
- If userData.targetRole is provided, place it in the most suitable section for this format (for example: Target Role, Career Objective, Professional Summary, or Summary of Qualifications).
- Use bullet points (starting with "• ") for lists within content.
- Keep all text in the content field (do not use nested JSON).
- Do not wrap bullets in arrays, just use newlines with • prefix.
- ${lengthGuidance}`;

  const raw = await callGeminiAPI(prompt);
  
  // Robust JSON extraction
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    // If no curly braces found, try stripping markdown fences as fallback
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned) as GeneratedResumeData;
    if (userData.photoUri) {
      parsed.photoUri = userData.photoUri;
    }
    return ensureTargetRoleInResume(parsed, userData?.targetRole, template);
  } catch (parseError) {
    console.error('Failed to parse Gemini JSON:', cleaned);
    throw new Error('Invalid JSON format from AI');
  }
}

export async function getTemplateRecommendations(userData: any, jobField: string, templates: ResumeTemplate[]) {
  const templateList = templates.map(t => `ID: ${t.id}, Name: ${t.name}, Description: ${t.description}`).join('\n');
  const prompt = `You are a career expert. Given the following user information: 
${JSON.stringify({ 
  targetRole: userData.targetRole, 
  professionalSummary: userData.professionalSummary,
  hasExperience: !!userData.workExperience?.length,
  hasEducation: !!userData.education?.length
})}
Target job/field: ${jobField}

Here are the 4 available resume templates:
${templateList}

Recommend the SINGLE most suitable template ID for this user.
Return ONLY a valid JSON object: {"id": "template-id", "reason": "short explanation"}`;

  try {
    const raw = await callGeminiAPI(prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return [JSON.parse(cleaned) as TemplateRecommendation]; // return as array of 1 for backward compatibility
  } catch (error) {
    console.error('Error getting template recommendation:', error);
    // Fallback to basic logic if AI fails
    const hasExp = !!userData.workExperience?.length;
    return [
      { 
        id: hasExp ? 'history-no-photo' : 'skill-no-photo', 
        reason: hasExp ? 'A traditional chronological format is best since you have work experience.' : 'A skill-based format highlights your projects and education best.' 
      }
    ];
  }
}
