import Constants from 'expo-constants';

// Direct REST API call to Gemini
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export interface JobDetails {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | 'COMPANY_SPECIFIC';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tips?: string;
}

export class InterviewAI {
  
  static async generateQuestions(jobDetails: JobDetails): Promise<InterviewQuestion[]> {
    // Try AI first, fallback if it fails
    try {
      console.log('🤖 Attempting AI generation for:', jobDetails.jobTitle, 'at', jobDetails.companyName);
      
      const prompt = `
You are a senior technical interviewer with 10+ years of experience.

Generate 6-8 realistic interview questions for:
Job Title: ${jobDetails.jobTitle}
Company: ${jobDetails.companyName}
${jobDetails.jobDescription ? `Job Description: ${jobDetails.jobDescription}` : ''}

Requirements:
- Mix of technical, behavioral, and situational questions
- Include 1-2 company-specific questions if possible
- Vary difficulty levels (2 easy, 3-4 medium, 2 hard)
- Provide expert tips for each question

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "category": "TECHNICAL",
      "difficulty": "MEDIUM",
      "tips": "Expert tip for answering this question"
    }
  ]
}

Make questions realistic and relevant to the specific role.
      `;

      console.log('📤 Sending request to Gemini API (REST)...');
      const text = await callGeminiAPI(prompt);
      console.log('📥 Received response from Gemini API');
      console.log('📝 Response text length:', text.length);
      console.log('📝 First 100 chars:', text.substring(0, 100));
      
      // Clean the response to ensure it's valid JSON
      let cleanedText = text;
      if (text.startsWith('```json')) {
        cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      }
      
      try {
        const parsed = JSON.parse(cleanedText);
        const questions = parsed.questions || [];
        
        if (questions.length > 0) {
          console.log('🎉 AI generation successful! Generated', questions.length, 'questions');
          // Add IDs if missing
          return questions.map((q: any, index: number) => ({
            ...q,
            id: q.id || `ai_q${index + 1}`
          }));
        } else {
          throw new Error('No questions in AI response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', cleanedText);
        throw parseError;
      }
      
    } catch (error: any) {
      console.warn('⚠️ AI generation failed, using fallback questions.');
      console.error('Error details:', error?.message || error);
      console.error('Error type:', error?.constructor?.name || 'Unknown');
      console.error('Error code:', error?.code || 'No code available');
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      // Return fallback questions instead of throwing
      return InterviewAI.getFallbackQuestions(jobDetails);
    }
  }

  // Enhanced fallback questions with job-specific variations
  static getFallbackQuestions(jobDetails: JobDetails): InterviewQuestion[] {
    const role = jobDetails.jobTitle.toLowerCase();
    
    // Base questions for all roles
    let questions = [
      {
        id: 'q1',
        question: `Tell me about your experience relevant to the ${jobDetails.jobTitle} position.`,
        category: 'BEHAVIORAL' as const,
        difficulty: 'EASY' as const,
        tips: 'Use the STAR method: Situation, Task, Action, Result. Focus on achievements that directly relate to the job requirements.'
      },
      {
        id: 'q2', 
        question: `Why do you want to work at ${jobDetails.companyName}?`,
        category: 'COMPANY_SPECIFIC' as const,
        difficulty: 'EASY' as const,
        tips: 'Research the company\'s values, recent achievements, and culture. Show genuine interest and alignment with their mission.'
      }
    ];

    // Add role-specific questions
    if (role.includes('engineer') || role.includes('developer') || role.includes('programmer')) {
      questions.push(
        {
          id: 'q3',
          question: 'Describe your experience with version control and collaborative coding.',
          category: 'TECHNICAL' as const,
          difficulty: 'MEDIUM' as const,
          tips: 'Mention Git, code reviews, branching strategies, and team workflows you\'ve used.'
        },
        {
          id: 'q4',
          question: 'How do you approach debugging a complex technical issue?',
          category: 'TECHNICAL' as const,
          difficulty: 'MEDIUM' as const,
          tips: 'Describe your systematic approach: reproduce the bug, isolate the problem, use debugging tools, and document the solution.'
        }
      );
    } else if (role.includes('manager') || role.includes('lead')) {
      questions.push(
        {
          id: 'q3',
          question: 'How do you motivate and manage a diverse team?',
          category: 'BEHAVIORAL' as const,
          difficulty: 'MEDIUM' as const,
          tips: 'Share specific examples of leadership, delegation, and conflict resolution. Mention different management styles you adapt.'
        },
        {
          id: 'q4', 
          question: 'Describe how you handle competing priorities and resource allocation.',
          category: 'SITUATIONAL' as const,
          difficulty: 'HARD' as const,
          tips: 'Show your decision-making process, stakeholder communication, and ability to make tough calls under pressure.'
        }
      );
    } else if (role.includes('marketing') || role.includes('sales')) {
      questions.push(
        {
          id: 'q3',
          question: 'How do you measure the success of a marketing campaign?',
          category: 'TECHNICAL' as const,
          difficulty: 'MEDIUM' as const,
          tips: 'Mention specific KPIs, analytics tools, ROI calculations, and conversion metrics relevant to the role.'
        },
        {
          id: 'q4',
          question: 'Tell me about a time when you had to pivot a strategy based on market feedback.', 
          category: 'BEHAVIORAL' as const,
          difficulty: 'MEDIUM' as const,
          tips: 'Show adaptability, data-driven decision making, and ability to learn from market signals.'
        }
      );
    }

    // Add common questions for all roles
    questions.push(
      {
        id: 'q5',
        question: 'How do you handle working under pressure and tight deadlines?',
        category: 'BEHAVIORAL' as const,
        difficulty: 'MEDIUM' as const, 
        tips: 'Share specific strategies you use for time management and stress handling. Give a real example.'
      },
      {
        id: 'q6',
        question: 'Where do you see yourself in 5 years?',
        category: 'BEHAVIORAL' as const,
        difficulty: 'EASY' as const,
        tips: 'Show ambition while aligning with the company\'s growth path. Mention skills you want to develop.'
      },
      {
        id: 'q7',
        question: `How would you contribute to the team dynamics at ${jobDetails.companyName}?`,
        category: 'COMPANY_SPECIFIC' as const, 
        difficulty: 'MEDIUM' as const,
        tips: 'Highlight your collaboration skills, communication style, and how you support team goals.'
      },
      {
        id: 'q8',
        question: 'Tell me about a time when you had to learn something new quickly.',
        category: 'BEHAVIORAL' as const,
        difficulty: 'HARD' as const,
        tips: 'Demonstrate adaptability and learning agility. Show how you approach new challenges systematically.'
      }
    );

    return questions;
  }
}