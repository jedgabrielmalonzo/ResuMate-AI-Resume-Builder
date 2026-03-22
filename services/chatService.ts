import Constants from 'expo-constants';

const GEMINI_API_KEY =
  Constants.expoConfig?.extra?.geminiApiKey ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  '';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const SYSTEM_PROMPT = `You are ResumAI, a friendly and helpful career assistant built into the ResuMate app.

Your two main purposes are:

1. CAREER ROADMAP & PATHING
   - Help users figure out their career path (especially students and fresh graduates)
   - Suggest what skills to learn, what certifications help, how long it realistically takes
   - Advise what to put on their resume for their target role
   - Provide step-by-step learning roadmaps for any career field

2. APP GUIDE & FAQ
   - Help users navigate and use the ResuMate app
   - The app has: Resume Builder (builds an AI-generated resume from user info), Interview Prep (generates mock interview questions for a job), Account page (view/delete saved resumes), Settings, and you (the chatbot)
   - How to export PDF: Go to resume result screen → tap "Save Document"
   - How to find saved resumes: Go to Account tab in the bottom navigation
   - How to build a resume: Tap "Build my resume" on the Home screen
   - How to do interview prep: Tap "Interview prep" on the Home screen

Keep your answers concise, encouraging, and actionable. Use bullet points when listing steps. 
If asked something unrelated to careers or the app, politely redirect the conversation back to career topics.`;

/**
 * Builds the contents array for a multi-turn Gemini chat.
 * Gemini requires alternating user/model turns, and the system instruction
 * is sent as a separate field.
 */
function buildContents(history: ChatMessage[]) {
  return history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));
}

export async function sendChatMessage(
  history: ChatMessage[],
  userText: string
): Promise<string> {
  const contents = buildContents([
    ...history,
    { id: '', role: 'user', text: userText },
  ]);

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not get a response. Please try again.';
}
