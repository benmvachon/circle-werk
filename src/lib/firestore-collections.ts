import { collection, CollectionReference } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase";
import type { User, Circle, Story, Entry, Assignment } from "../types/firestore";

export const COLLECTIONS = {
  USERS: "users",
  CIRCLES: "circles",
  STORIES: "stories",
  ENTRIES: "entries",
  ASSIGNMENTS: "assignments",
} as const;

const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const usersCollection = createCollection<User>(COLLECTIONS.USERS);
export const circlesCollection = createCollection<Circle>(COLLECTIONS.CIRCLES);
export const storiesCollection = createCollection<Story>(COLLECTIONS.STORIES);
export const entriesCollection = createCollection<Entry>(COLLECTIONS.ENTRIES);
export const assignmentsCollection = createCollection<Assignment>(COLLECTIONS.ASSIGNMENTS);
