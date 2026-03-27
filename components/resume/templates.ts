export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  formatType: 'functional' | 'chronological';
  hasPhoto: boolean;
  description: string;
  sections: string[];
  bestFor?: string;
  jobFields?: string[];
  tips?: string[];
  isActive?: boolean;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'skill-no-photo',
    name: 'Skill/Achievement Based',
    category: 'Skills Focused',
    formatType: 'functional',
    hasPhoto: false,
    description: 'Highlights projects, internships, and core skills first. Clean and ATS-friendly.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Technical Skills',
      'Project Highlights',
      'Education'
    ],
    bestFor: 'Undergrads, fresh grads, or applicants wanting to highlight projects and extracurriculars.',
    jobFields: ['Technology', 'Creative', 'Entry-Level Roles', 'Freelance'],
    tips: [
      'Focus on measurable outcomes in your projects.',
      'Group your technical skills into categories (e.g., Frontend, Backend).'
    ],
  },
  {
    id: 'skill-with-photo',
    name: 'Skill/Achievement Based (With 1x1 Photo)',
    category: 'Skills Focused',
    formatType: 'functional',
    hasPhoto: true,
    description: 'Same skill-focused layout but includes a professional 1x1 ID photo in the header.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Technical Skills',
      'Project Highlights',
      'Education'
    ],
    bestFor: 'Local job applications, internships, or school forms requiring an ID photo.',
    jobFields: ['Internships', 'Local Corporate Roles', 'Government Forms'],
    tips: [
      'Ensure your 1x1 photo has a neutral background.',
      'Wear professional or business-casual attire.'
    ],
  },
  {
    id: 'history-no-photo',
    name: 'Education/Job History Based',
    category: 'Career/Education Timeline',
    formatType: 'chronological',
    hasPhoto: false,
    description: 'Traditional formal layout focusing on education and chronological work/internship experience.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Education',
      'Professional Experience',
      'Skills'
    ],
    bestFor: 'Students with formal internships or fresh grads applying to traditional corporate roles.',
    jobFields: ['Finance', 'Business', 'Operations', 'Corporate Roles'],
    tips: [
      'List your most recent education or work experience first.',
      'Use action verbs (e.g., Led, Developed) for your experience bullets.'
    ],
  },
  {
    id: 'history-with-photo',
    name: 'Education/Job History Based (With 1x1 Photo)',
    category: 'Career/Education Timeline',
    formatType: 'chronological',
    hasPhoto: true,
    description: 'Traditional layout combined with a professional 1x1 ID photo for complete formal applications.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Education',
      'Professional Experience',
      'Skills'
    ],
    bestFor: 'Applications that strict require a formal resume attached with an ID picture.',
    jobFields: ['Healthcare', 'Local Enterprise', 'Traditional Agencies'],
    tips: [
      'Keep the photo formal and well-lit.',
      'Ensure dates are consistent (e.g., MM/YYYY format).'
    ],
  }
];
