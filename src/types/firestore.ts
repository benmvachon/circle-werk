import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  notification_preferences: {
    email_enabled: boolean;
    push_enabled: boolean;
    reminder_hours_before_deadline: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Circle {
  id: string;
  name: string;
  cadence_hours: number;
  start_at: Timestamp;
  member_ids: string[];
  rotation_order: string[];
  created_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type StoryStatus = "active" | "complete";

export interface Story {
  id: string;
  circle_id: string;
  owner_id: string;
  status: StoryStatus;
  title?: string;
  current_round: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  completed_at?: Timestamp;
}

export interface Entry {
  id: string;
  story_id: string;
  user_id: string;
  round_number: number;
  content: string;
  created_at: Timestamp;
  locked_at: Timestamp;
}

export interface Assignment {
  id: string;
  user_id: string;
  story_id: string;
  circle_id: string;
  round_number: number;
  assigned_at: Timestamp;
  due_at: Timestamp;
  submitted: boolean;
  submitted_at?: Timestamp;
}

export interface CreateUserData {
  name: string;
  email: string;
  notification_preferences?: Partial<User["notification_preferences"]>;
}

export interface CreateCircleData {
  name: string;
  cadence_hours?: number;
  start_at?: Timestamp;
  member_ids: string[];
  created_by: string;
}

export interface CreateStoryData {
  circle_id: string;
  owner_id: string;
  title?: string;
}

export interface CreateEntryData {
  story_id: string;
  user_id: string;
  round_number: number;
  content: string;
  locked_at: Timestamp;
}

export interface CreateAssignmentData {
  user_id: string;
  story_id: string;
  circle_id: string;
  round_number: number;
  due_at: Timestamp;
}
