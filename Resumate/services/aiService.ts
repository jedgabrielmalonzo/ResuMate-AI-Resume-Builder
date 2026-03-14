import { ResumeTemplate } from '@/components/resume/templates';
import { GeneratedResumeData } from '@/context/ResumeContext';
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

type TemplateRecommendation = {
  id: string;
  reason: string;
};

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
  const parsed = JSON.parse(cleaned);
  return parsed as GeneratedResumeData;
}

export async function getTemplateRecommendations(
  userData: any,
  jobField: string,
  templates: ResumeTemplate[]
): Promise<TemplateRecommendation[]> {
  const workExperience = Array.isArray(userData?.workExperience)
    ? userData.workExperience
    : [];
  const education = Array.isArray(userData?.education) ? userData.education : [];
  const skills = Array.isArray(userData?.skills)
    ? userData.skills.filter((s: string) => typeof s === 'string')
    : [];
  const achievements = Array.isArray(userData?.achievements)
    ? userData.achievements
    : [];

  const experienceCompleteness = workExperience.reduce((total: number, item: any) => {
    if (!item || typeof item !== 'object') return total;
    return (
      total +
      countFilled([
        String(item.jobTitle ?? ''),
        String(item.company ?? ''),
        String(item.startDate ?? ''),
        String(item.endDate ?? ''),
        String(item.description ?? ''),
      ])
    );
  }, 0);

  const hasStrongExperience = workExperience.length >= 2 && experienceCompleteness >= 8;
  const hasLimitedExperience = workExperience.length <= 1 || experienceCompleteness <= 3;
  const hasStrongSkills = countFilled(skills) >= 4;
  const hasStrongProjectsOrAchievements = achievements.length >= 2;
  const hasEducationFocus = education.length > 0;
  const field = jobField.toLowerCase();
  const wantsMini = /network|fair|event|quick|short|intro|pitch/.test(field);
  const studentSignal = /student|intern|entry|junior|graduate|fresh/.test(field);

  const scored = templates.map((template) => {
    let score = 0;

    switch (template.formatType) {
      case 'chronological':
        if (hasStrongExperience) score += 4;
        if (hasLimitedExperience) score -= 1;
        if (/operations|finance|health|admin|corporate/.test(field)) score += 2;
        break;
      case 'functional':
        if (hasStrongSkills) score += 3;
        if (hasStrongProjectsOrAchievements) score += 2;
        if (hasLimitedExperience) score += 2;
        if (/creative|transition|freelance|marketing|design/.test(field)) score += 2;
        break;
      case 'hybrid':
        if (hasStrongExperience) score += 3;
        if (hasStrongSkills) score += 2;
        if (/technology|tech|product|management|engineer|analysis/.test(field)) score += 2;
        break;
      case 'mini':
        if (wantsMini) score += 6;
        if (/sales|startup|recruiter/.test(field)) score += 2;
        break;
      case 'student-entry':
        if (studentSignal) score += 4;
        if (hasEducationFocus) score += 2;
        if (hasLimitedExperience) score += 2;
        break;
    }

    return {
      template,
      score,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ template }) => ({
      id: template.id,
      reason: `${getTemplateBaseReason(template)} Suitable fields: ${template.jobFields
        .slice(0, 3)
        .join(', ')}.`,
    }));
}
