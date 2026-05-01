import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { assignmentsCollection } from "./firestore-collections";
import type { Assignment, CreateAssignmentData, Circle } from "../types/firestore";

export async function createAssignment(
  assignmentId: string, 
  data: CreateAssignmentData
): Promise<Assignment> {
  const assignmentDoc = doc(assignmentsCollection, assignmentId);
  
  const assignmentData: Assignment = {
    id: assignmentId,
    user_id: data.user_id,
    story_id: data.story_id,
    circle_id: data.circle_id,
    round_number: data.round_number,
    assigned_at: serverTimestamp() as Timestamp,
    due_at: data.due_at,
    submitted: false,
  };
  
  await setDoc(assignmentDoc, assignmentData);
  return assignmentData;
}

export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  const assignmentDoc = doc(assignmentsCollection, assignmentId);
  const snapshot = await getDoc(assignmentDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as Assignment;
}

export async function getUserAssignments(
  userId: string, 
  submitted?: boolean
): Promise<Assignment[]> {
  let q = query(
    assignmentsCollection,
    where("user_id", "==", userId),
    orderBy("due_at", "asc")
  );
  
  if (submitted !== undefined) {
    q = query(
      assignmentsCollection,
      where("user_id", "==", userId),
      where("submitted", "==", submitted),
      orderBy("due_at", "asc")
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Assignment);
}

export async function getStoryAssignments(storyId: string): Promise<Assignment[]> {
  const q = query(
    assignmentsCollection,
    where("story_id", "==", storyId),
    orderBy("round_number", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Assignment);
}

export async function markAssignmentSubmitted(
  assignmentId: string
): Promise<void> {
  const assignmentDoc = doc(assignmentsCollection, assignmentId);
  
  await updateDoc(assignmentDoc, {
    submitted: true,
    submitted_at: serverTimestamp(),
  });
}

export async function getActiveAssignments(userId: string): Promise<Assignment[]> {
  const now = Timestamp.now();
  const assignments = await getUserAssignments(userId, false);
  
  return assignments.filter(assignment => assignment.due_at > now);
}

export async function getOverdueAssignments(userId: string): Promise<Assignment[]> {
  const now = Timestamp.now();
  const assignments = await getUserAssignments(userId, false);
  
  return assignments.filter(assignment => assignment.due_at <= now);
}

export function calculateDueDate(circle: Circle, roundNumber: number): Timestamp {
  const startTime = circle.start_at.toMillis();
  const cadenceMs = circle.cadence_hours * 60 * 60 * 1000;
  const dueTimeMs = startTime + (roundNumber * cadenceMs);
  
  return Timestamp.fromMillis(dueTimeMs);
}

export function generateAssignmentId(
  userId: string, 
  storyId: string, 
  roundNumber: number
): string {
  return `${userId}_${storyId}_${roundNumber}`;
}
