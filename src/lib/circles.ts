import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { circlesCollection } from "./firestore-collections";
import type { Circle, CreateCircleData } from "../types/firestore";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function createCircle(circleId: string, data: CreateCircleData): Promise<Circle> {
  if (data.member_ids.length < 6 || data.member_ids.length > 8) {
    throw new Error("Circle must have between 6 and 8 members");
  }
  
  const circleDoc = doc(circlesCollection, circleId);
  
  const circleData: Circle = {
    id: circleId,
    name: data.name,
    cadence_hours: data.cadence_hours ?? 48,
    start_at: data.start_at ?? (serverTimestamp() as Timestamp),
    member_ids: data.member_ids,
    rotation_order: shuffleArray(data.member_ids),
    created_by: data.created_by,
    created_at: serverTimestamp() as Timestamp,
    updated_at: serverTimestamp() as Timestamp,
  };
  
  await setDoc(circleDoc, circleData);
  return circleData;
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const circleDoc = doc(circlesCollection, circleId);
  const snapshot = await getDoc(circleDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as Circle;
}

export async function getUserCircles(userId: string): Promise<Circle[]> {
  const q = query(
    circlesCollection,
    where("member_ids", "array-contains", userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Circle);
}

export async function updateCircleName(circleId: string, name: string): Promise<void> {
  const circleDoc = doc(circlesCollection, circleId);
  
  await updateDoc(circleDoc, {
    name,
    updated_at: serverTimestamp(),
  });
}

export function getNextWriterInRotation(circle: Circle, currentRound: number): string {
  const index = currentRound % circle.rotation_order.length;
  return circle.rotation_order[index];
}
