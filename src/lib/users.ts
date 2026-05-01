import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, documentId, Timestamp, serverTimestamp } from "firebase/firestore";
import { usersCollection } from "./firestore-collections";
import type { User, CreateUserData } from "../types/firestore";

export async function createUser(userId: string, data: CreateUserData): Promise<void> {
  const userDoc = doc(usersCollection, userId);
  
  const userData: User = {
    id: userId,
    name: data.name,
    email: data.email,
    notification_preferences: {
      email_enabled: data.notification_preferences?.email_enabled ?? true,
      push_enabled: data.notification_preferences?.push_enabled ?? false,
      reminder_hours_before_deadline: data.notification_preferences?.reminder_hours_before_deadline ?? 24,
    },
    created_at: serverTimestamp() as Timestamp,
    updated_at: serverTimestamp() as Timestamp,
  };
  
  await setDoc(userDoc, userData);
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = doc(usersCollection, userId);
  const snapshot = await getDoc(userDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as User;
}

export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<User["notification_preferences"]>
): Promise<void> {
  const userDoc = doc(usersCollection, userId);
  
  await updateDoc(userDoc, {
    notification_preferences: preferences,
    updated_at: serverTimestamp(),
  });
}

export async function searchUsersByEmail(email: string): Promise<User[]> {
  const q = query(
    usersCollection,
    where("email", ">=", email.toLowerCase()),
    where("email", "<", email.toLowerCase() + "\uf8ff")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as User);
}

export async function searchUsersByName(namePrefix: string): Promise<User[]> {
  const q = query(
    usersCollection,
    where("name", ">=", namePrefix),
    where("name", "<", namePrefix + "\uf8ff")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as User);
}

export async function searchUsers(searchTerm: string): Promise<User[]> {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.trim();
  const [byEmail, byName] = await Promise.all([
    searchUsersByEmail(term),
    searchUsersByName(term),
  ]);

  const seen = new Set<string>();
  const results: User[] = [];
  for (const user of [...byEmail, ...byName]) {
    if (!seen.has(user.id)) {
      seen.add(user.id);
      results.push(user);
    }
  }
  return results;
}

export async function getUsersByIds(userIds: string[]): Promise<Map<string, User>> {
  const users = new Map<string, User>();
  if (userIds.length === 0) return users;

  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(usersCollection, where(documentId(), "in", chunk));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((d) => {
        const user = d.data() as User;
        users.set(user.id, user);
      });
    })
  );

  return users;
}
