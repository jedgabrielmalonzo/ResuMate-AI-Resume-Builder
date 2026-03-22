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

export interface SavedResume {
    id: string;
    userId: string;
    title: string;
    templateId: string;
    resumeData: GeneratedResumeData;
    createdAt: any;
}

const RESUMES_COLLECTION = 'resumes';

export const resumeService = {
    /**
     * Save a generated resume to Firestore
     */
    async saveResume(userId: string, resumeData: GeneratedResumeData, templateId: string) {
        try {
            // Create a default title if none exists
            const title = `${resumeData.sections?.[0]?.content?.split('\n')?.[0] || 'My'} Resume`;

            const docRef = await addDoc(collection(db, RESUMES_COLLECTION), {
                userId,
                title,
                templateId,
                resumeData,
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
    }
};
