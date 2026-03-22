import { createContext, useContext, useState } from 'react';

export interface ResumeSection {
  title: string;
  content: string;
}

export interface GeneratedResumeData {
  sections: ResumeSection[];
}

interface ResumeContextType {
  generatedResumeData: GeneratedResumeData | null;
  setGeneratedResumeData: (data: GeneratedResumeData | null) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

export const ResumeContext = createContext<ResumeContextType>({
  generatedResumeData: null,
  setGeneratedResumeData: () => {},
  selectedTemplateId: null,
  setSelectedTemplateId: () => {},
});

export function useResumeContext() {
  return useContext(ResumeContext);
}
