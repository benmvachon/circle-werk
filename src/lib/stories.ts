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
import { storiesCollection } from "./firestore-collections";
import type { Story, CreateStoryData, StoryStatus } from "../types/firestore";

export async function createStory(storyId: string, data: CreateStoryData): Promise<Story> {
  const storyDoc = doc(storiesCollection, storyId);
  
  const storyData: Story = {
    id: storyId,
    circle_id: data.circle_id,
    owner_id: data.owner_id,
    status: "active",
    title: data.title,
    current_round: 0,
    created_at: serverTimestamp() as Timestamp,
    updated_at: serverTimestamp() as Timestamp,
  };
  
  await setDoc(storyDoc, storyData);
  return storyData;
}

export async function getStory(storyId: string): Promise<Story | null> {
  const storyDoc = doc(storiesCollection, storyId);
  const snapshot = await getDoc(storyDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as Story;
}

export async function getCircleStories(
  circleId: string, 
  status?: StoryStatus
): Promise<Story[]> {
  let q = query(
    storiesCollection,
    where("circle_id", "==", circleId),
    orderBy("created_at", "desc")
  );
  
  if (status) {
    q = query(
      storiesCollection,
      where("circle_id", "==", circleId),
      where("status", "==", status),
      orderBy("created_at", "desc")
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Story);
}

export async function getUserStories(userId: string): Promise<Story[]> {
  const q = query(
    storiesCollection,
    where("owner_id", "==", userId),
    orderBy("created_at", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Story);
}

export async function updateStoryStatus(
  storyId: string, 
  status: StoryStatus
): Promise<void> {
  const storyDoc = doc(storiesCollection, storyId);
  
  const updateData: Partial<Story> = {
    status,
    updated_at: serverTimestamp() as Timestamp,
  };
  
  if (status === "complete") {
    updateData.completed_at = serverTimestamp() as Timestamp;
  }
  
  await updateDoc(storyDoc, updateData);
}

export async function incrementStoryRound(storyId: string): Promise<void> {
  const storyDoc = doc(storiesCollection, storyId);
  const story = await getStory(storyId);
  
  if (!story) {
    throw new Error("Story not found");
  }
  
  await updateDoc(storyDoc, {
    current_round: story.current_round + 1,
    updated_at: serverTimestamp(),
  });
}
