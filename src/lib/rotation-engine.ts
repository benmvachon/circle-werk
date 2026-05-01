import { Timestamp } from "firebase/firestore";
import { getCircle, getNextWriterInRotation } from "./circles";
import { getStory, incrementStoryRound } from "./stories";
import { createAssignment, calculateDueDate, generateAssignmentId } from "./assignments";
import { createEntry } from "./entries";
import type { Circle } from "../types/firestore";

export interface RotationResult {
  success: boolean;
  nextAssignmentId?: string;
  error?: string;
}

export async function submitEntryAndRotate(
  userId: string,
  storyId: string,
  roundNumber: number,
  content: string
): Promise<RotationResult> {
  try {
    const story = await getStory(storyId);
    if (!story) {
      return { success: false, error: "Story not found" };
    }
    
    const circle = await getCircle(story.circle_id);
    if (!circle) {
      return { success: false, error: "Circle not found" };
    }
    
    if (story.current_round !== roundNumber) {
      return { success: false, error: "Round mismatch" };
    }
    
    const dueDate = calculateDueDate(circle, roundNumber);
    const now = Timestamp.now();
    
    if (now > dueDate) {
      return { success: false, error: "Deadline has passed" };
    }
    
    const entryId = `${storyId}_${roundNumber}`;
    await createEntry(entryId, {
      story_id: storyId,
      user_id: userId,
      round_number: roundNumber,
      content,
      locked_at: dueDate,
    });
    
    await incrementStoryRound(storyId);
    
    const nextRound = roundNumber + 1;
    const nextWriter = getNextWriterInRotation(circle, nextRound);
    const nextDueDate = calculateDueDate(circle, nextRound);
    const nextAssignmentId = generateAssignmentId(nextWriter, storyId, nextRound);
    
    await createAssignment(nextAssignmentId, {
      user_id: nextWriter,
      story_id: storyId,
      circle_id: circle.id,
      round_number: nextRound,
      due_at: nextDueDate,
    });
    
    return { success: true, nextAssignmentId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function initializeStoryRotation(
  storyId: string
): Promise<RotationResult> {
  try {
    const story = await getStory(storyId);
    if (!story) {
      return { success: false, error: "Story not found" };
    }
    
    const circle = await getCircle(story.circle_id);
    if (!circle) {
      return { success: false, error: "Circle not found" };
    }
    
    const firstRound = 0;
    const firstWriter = getNextWriterInRotation(circle, firstRound);
    const firstDueDate = calculateDueDate(circle, firstRound);
    const firstAssignmentId = generateAssignmentId(firstWriter, storyId, firstRound);
    
    await createAssignment(firstAssignmentId, {
      user_id: firstWriter,
      story_id: storyId,
      circle_id: circle.id,
      round_number: firstRound,
      due_at: firstDueDate,
    });
    
    return { success: true, nextAssignmentId: firstAssignmentId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export function isDeadlinePassed(dueDate: Timestamp): boolean {
  return Timestamp.now() > dueDate;
}

export function getTimeUntilDeadline(dueDate: Timestamp): number {
  const now = Timestamp.now();
  return dueDate.toMillis() - now.toMillis();
}

export function shouldStoryComplete(circle: Circle, currentRound: number): boolean {
  return currentRound >= circle.member_ids.length;
}
