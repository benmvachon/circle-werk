import { 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { entriesCollection } from "./firestore-collections";
import type { Entry, CreateEntryData } from "../types/firestore";

const MAX_ENTRY_LENGTH = 1200;

export async function createEntry(entryId: string, data: CreateEntryData): Promise<Entry> {
  if (data.content.length > MAX_ENTRY_LENGTH) {
    throw new Error(`Entry content must be ${MAX_ENTRY_LENGTH} characters or less`);
  }
  
  if (data.content.trim().length === 0) {
    throw new Error("Entry content cannot be empty");
  }
  
  const entryDoc = doc(entriesCollection, entryId);
  
  const entryData: Entry = {
    id: entryId,
    story_id: data.story_id,
    user_id: data.user_id,
    round_number: data.round_number,
    content: data.content,
    created_at: serverTimestamp() as Timestamp,
    locked_at: data.locked_at,
  };
  
  await setDoc(entryDoc, entryData);
  return entryData;
}

export async function getEntry(entryId: string): Promise<Entry | null> {
  const entryDoc = doc(entriesCollection, entryId);
  const snapshot = await getDoc(entryDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as Entry;
}

export async function getStoryEntries(storyId: string): Promise<Entry[]> {
  const q = query(
    entriesCollection,
    where("story_id", "==", storyId),
    orderBy("round_number", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Entry);
}

export async function getEntryForRound(
  storyId: string, 
  roundNumber: number
): Promise<Entry | null> {
  const q = query(
    entriesCollection,
    where("story_id", "==", storyId),
    where("round_number", "==", roundNumber)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data() as Entry;
}

export async function getUserEntries(userId: string): Promise<Entry[]> {
  const q = query(
    entriesCollection,
    where("user_id", "==", userId),
    orderBy("created_at", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Entry);
}

export function getFullStoryText(entries: Entry[]): string {
  return entries
    .sort((a, b) => a.round_number - b.round_number)
    .map(entry => entry.content)
    .join("\n\n");
}
