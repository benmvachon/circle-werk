import { doc, getDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
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
