import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const USERS_COLLECTION = "users";

export const userService = {
    async getAllUsers() {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    },

    async updateRole(userId, newRole) {
        const docRef = doc(db, USERS_COLLECTION, userId);
        return await updateDoc(docRef, { role: newRole });
    },

    async deleteUser(userId) {
        const docRef = doc(db, USERS_COLLECTION, userId);
        return await deleteDoc(docRef);
    }
};
