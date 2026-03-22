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
    return { sections: updated };
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
    return { sections: updated };
  }

  // 3) If no suitable section exists, insert a dedicated section near the top.
  const contactIdx = sectionTitles.findIndex((title) => title.includes('contact'));
  const insertAt = contactIdx >= 0 ? contactIdx + 1 : 0;
  const inserted = [...data.sections];
  inserted.splice(insertAt, 0, {
    title: template.formatType === 'mini' ? 'Target Role' : 'Career Objective',
    content: formalRoleLine,
  });
  return { sections: inserted };
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
    case 'hybrid':
      return [
        'Start with a strong qualifications/skills summary section.',
        'Follow with chronological professional experience to show career progression.',
      ].join(' ');
    case 'mini':
      return [
        'Keep the resume highly condensed and networking-ready.',
        'Use short bullets and only include the highest-value highlights.',
      ].join(' ');
    case 'student-entry':
      return [
        'Emphasize education, projects, internships/volunteer work, and transferable skills.',
        'Minimize formal work-history dependency and focus on potential and relevant output.',
      ].join(' ');
    case 'creative':
      return [
        'Focus on project outcomes, creative problem-solving, and unique technical skills.',
        'Use punchy, engaging language and emphasize portfolio highlights.',
      ].join(' ');
    case 'executive':
      return [
        'Prioritize high-level strategic impact, leadership philosophy, and business transformation.',
        'Focus on ROI, team scale, and board-level achievements.',
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
    case 'hybrid':
      return 'Best for showing both core strengths and a structured career timeline.';
    case 'mini':
      return 'Best for networking events and quick introductions.';
    case 'student-entry':
      return 'Best for students and fresh graduates building their first professional profile.';
    case 'creative':
      return 'Best for creative roles where projects and unique skills are the main focus.';
    case 'executive':
      return 'Best for high-level leadership roles requiring a focus on strategic impact.';
    default:
      return 'A suitable format based on your profile.';
  }
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function generateResume(userData: any, template: ResumeTemplate): Promise<GeneratedResumeData> {
  const sections = template.sections.join(', ');
  const formatInstructions = getFormatInstructions(template);
  const lengthGuidance =
    template.formatType === 'mini'
      ? 'Keep each section to 2-4 concise bullets and target one-page equivalent length.'
      : 'Keep content concise but complete, suitable for a full professional resume.';

  const prompt = `You are a professional resume writer. Generate a complete, well-structured resume as a JSON object for the following person using the "${template.name}" template.

Template sections to include (in order): ${sections}
Template format type: ${template.formatType}
Format-specific writing rules: ${formatInstructions}

User Information:
${JSON.stringify(userData, null, 2)}

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
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as GeneratedResumeData;
  return ensureTargetRoleInResume(parsed, userData?.targetRole, template);
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

Here are available resume templates:
${templateList}

Recommend the top 2-3 most suitable template IDs for this user and explain your choices in 1 short sentence each.
Return ONLY a valid JSON array of objects: [{"id": "template-id", "reason": "short explanation"}]`;

  try {
    const raw = await callGeminiAPI(prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as TemplateRecommendation[];
  } catch (error) {
    console.error('Error getting template recommendations:', error);
    // Fallback to basic logic if AI fails
    return [
      { id: 'chronological', reason: 'A safe, professional choice for most roles.' },
      { id: 'hybrid', reason: 'Good for balancing skills and experience.' }
    ];
  }
}
