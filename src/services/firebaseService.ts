
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch as fsWriteBatch, WriteBatch } from "firebase/firestore";
import { FirebaseConfig } from "../types";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initFirebase = (config: FirebaseConfig) => {
  if (!app) {
    try {
      app = initializeApp(config);
      db = getFirestore(app);
      console.log("Firebase Initialized Successfully");
      return true;
    } catch (e) {
      console.error("Firebase Initialization Failed", e);
      return false;
    }
  }
  return true;
};

export const getDb = () => db;

// Helper for writing data
export const saveToFirestore = async (collectionName: string, id: string, data: any) => {
    if (!db) return;
    try {
        await setDoc(doc(db, collectionName, id), data);
    } catch (e) {
        console.error(`Error writing to ${collectionName}:`, e);
    }
};

export const deleteFromFirestore = async (collectionName: string, id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
        console.error(`Error deleting from ${collectionName}:`, e);
    }
}

export const getBatch = (): WriteBatch | null => {
    if (!db) return null;
    return fsWriteBatch(db);
}
