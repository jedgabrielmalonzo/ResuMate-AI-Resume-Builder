export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  formatType:
    | 'chronological'
    | 'functional'
    | 'hybrid'
    | 'mini'
    | 'student-entry';
  description: string;
  sections: string[];
  bestFor: string;
  jobFields: string[];
  tips: string[];
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'chronological',
    name: 'Chronological Resume',
    category: 'Career Progression',
    formatType: 'chronological',
    description:
      'Lists work history in reverse chronological order, starting with the most recent role.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Work Experience',
      'Education',
      'Skills',
      'Certifications',
    ],
    bestFor:
      'Professionals with consistent work history who want to highlight career growth.',
    jobFields: ['Operations', 'Finance', 'Healthcare', 'Administrative', 'Corporate Roles'],
    tips: [
      'Show measurable impact in each role with numbers.',
      'Keep date formatting consistent (e.g., MM/YYYY).',
    ],
  },
  {
    id: 'functional',
    name: 'Functional Resume',
    category: 'Skills Focused',
    formatType: 'functional',
    description:
      'Highlights abilities, projects, and achievements first, with less emphasis on timeline.',
    sections: [
      'Contact Information',
      'Professional Summary',
      'Core Skills',
      'Key Achievements',
      'Projects',
      'Education',
    ],
    bestFor:
      'Career changers, freelancers, or applicants with employment gaps who want to spotlight strengths.',
    jobFields: ['Creative', 'Freelance', 'Career Transition', 'Customer Service', 'Marketing'],
    tips: [
      'Group skills by themes (technical, communication, leadership).',
      'Add outcome-focused bullets under each skill area.',
    ],
  },
  {
    id: 'hybrid',
    name: 'Combination / Hybrid Resume',
    category: 'Balanced',
    formatType: 'hybrid',
    description:
      'Combines a skills summary with chronological work experience to show both capability and growth.',
    sections: [
      'Contact Information',
      'Summary of Qualifications',
      'Core Skills',
      'Professional Experience',
      'Education',
      'Certifications',
    ],
    bestFor:
      'Mid-level candidates who need to demonstrate skills depth and career progression.',
    jobFields: ['Technology', 'Product', 'Management', 'Engineering', 'Business Analysis'],
    tips: [
      'Open with 4-6 strongest qualifications related to target role.',
      'Keep experience chronological and focused on impact.',
    ],
  },
  {
    id: 'mini',
    name: 'Mini Resume',
    category: 'Networking',
    formatType: 'mini',
    description:
      'A condensed resume format for fast introductions in networking events and quick opportunities.',
    sections: [
      'Name and Contact',
      'Target Role',
      'Top Skills',
      'Highlights',
      'Recent Experience',
    ],
    bestFor:
      'Job fairs, networking, and situations where a quick one-page overview is needed.',
    jobFields: ['Networking Events', 'Recruiter Outreach', 'Career Fairs', 'Sales', 'Startup Meetups'],
    tips: [
      'Limit each section to brief, high-value bullets.',
      'Focus on relevance to a single target role.',
    ],
  },
  {
    id: 'student-entry',
    name: 'Student / Entry-Level Resume',
    category: 'Student',
    formatType: 'student-entry',
    description:
      'Prioritizes education, internships, projects, volunteer work, and transferable skills.',
    sections: [
      'Contact Information',
      'Career Objective',
      'Education',
      'Relevant Coursework',
      'Projects',
      'Internships/Volunteer',
      'Skills',
      'Achievements',
    ],
    bestFor:
      'Students and fresh graduates with limited formal work experience.',
    jobFields: ['Internships', 'Graduate Programs', 'Entry-Level Roles', 'Campus Hiring', 'Junior Developer Roles'],
    tips: [
      'Highlight class projects with tools used and measurable outcomes.',
      'Include leadership, organization roles, and volunteer impact.',
    ],
  },
];
