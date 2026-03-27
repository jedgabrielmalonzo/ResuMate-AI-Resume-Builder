import { 
    collection, 
    getDocs, 
    doc, 
    addDoc, 
    setDoc,
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const TEMPLATES_COLLECTION = "templates";

export const templateService = {
    async getAllTemplates() {
        const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
        const templates = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() });
        });
        return templates;
    },

    async addTemplate(templateData) {
        if (templateData.id) {
            const docRef = doc(db, TEMPLATES_COLLECTION, templateData.id);
            const { id, ...data } = templateData;
            return await setDoc(docRef, {
                ...data,
                createdAt: new Date().toISOString()
            });
        }
        return await addDoc(collection(db, TEMPLATES_COLLECTION), {
            ...templateData,
            createdAt: new Date().toISOString()
        });
    },

    async updateTemplate(id, templateData) {
        const docRef = doc(db, TEMPLATES_COLLECTION, id);
        return await updateDoc(docRef, templateData);
    },

    async deleteTemplate(id) {
        const docRef = doc(db, TEMPLATES_COLLECTION, id);
        return await deleteDoc(docRef);
    },

    async toggleVisibility(templateId, isActive) {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        return await updateDoc(docRef, { isActive });
    },

    async resetTemplates() {
        try {
            const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
            const deletePromises = [];
            querySnapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(db, TEMPLATES_COLLECTION, document.id)));
            });
            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error("Error resetting templates:", error);
            throw error;
        }
    }
};
