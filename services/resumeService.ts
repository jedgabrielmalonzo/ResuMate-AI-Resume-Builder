import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { GeneratedResumeData } from '@/context/ResumeContext';

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

export interface SavedResume {
    id: string;
    userId: string;
    title: string;
    templateId: string;
    resumeData: GeneratedResumeData;
    userData?: any; // Add raw user data for auto-fill
    createdAt: any;
}

const RESUMES_COLLECTION = 'resumes';
const TEMPLATES_COLLECTION = 'templates';

export const resumeService = {
    /**
     * Save a generated resume to Firestore
     */
    async saveResume(userId: string, resumeData: GeneratedResumeData, templateId: string, userData?: any) {
        try {
            // Create a default title if none exists
            const title = `${resumeData.sections?.[0]?.content?.split('\n')?.[0] || 'My'} Resume`;

            const docRef = await addDoc(collection(db, RESUMES_COLLECTION), {
                userId,
                title,
                templateId,
                resumeData,
                userData, // Save raw inputs
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error('Error saving resume:', error);
            throw error;
        }
    },

    /**
     * Get all resumes for a specific user
     */
    async getUserResumes(userId: string): Promise<SavedResume[]> {
        try {
            const q = query(
                collection(db, RESUMES_COLLECTION),
                where('userId', '==', userId)
                // orderBy('createdAt', 'desc') // Requires a composite index in Firestore
            );

            const querySnapshot = await getDocs(q);
            const resumes: SavedResume[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                resumes.push({
                    id: doc.id,
                    ...data,
                } as SavedResume);
            });

            return resumes;
        } catch (error) {
            console.error('Error fetching resumes:', error);
            throw error;
        }
    },

    /**
     * Delete a resume from Firestore
     */
    async deleteResume(resumeId: string) {
        try {
            await deleteDoc(doc(db, RESUMES_COLLECTION, resumeId));
        } catch (error) {
            console.error('Error deleting resume:', error);
            throw error;
        }
    },

    /**
     * Get all active resume templates from Firestore
     */
    async getTemplates(): Promise<ResumeTemplate[]> {
        try {
            const q = query(
                collection(db, TEMPLATES_COLLECTION),
                where('isActive', '==', true)
            );

            const querySnapshot = await getDocs(q);
            const templates: ResumeTemplate[] = [];

            querySnapshot.forEach((doc) => {
                templates.push({
                    id: doc.id,
                    ...doc.data(),
                } as ResumeTemplate);
            });

            return templates;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }
};
