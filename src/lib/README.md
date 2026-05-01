# Firestore Library - Usage Guide

This directory contains helper functions for interacting with the Circle Werk Firestore database.

## Quick Start

### Import Collections

```typescript
import { 
  usersCollection, 
  circlesCollection, 
  storiesCollection,
  entriesCollection,
  assignmentsCollection 
} from './lib/firestore-collections';
```

### Import Helper Functions

```typescript
import { createUser, getUser } from './lib/users';
import { createCircle, getUserCircles } from './lib/circles';
import { createStory, getCircleStories } from './lib/stories';
import { createEntry, getStoryEntries } from './lib/entries';
import { getUserAssignments, markAssignmentSubmitted } from './lib/assignments';
import { submitEntryAndRotate, initializeStoryRotation } from './lib/rotation-engine';
```

## Common Workflows

### 1. Create a New User Profile

```typescript
import { createUser } from './lib/users';

await createUser(authUser.uid, {
  name: "Jane Doe",
  email: authUser.email,
  notification_preferences: {
    email_enabled: true,
    push_enabled: false,
    reminder_hours_before_deadline: 24
  }
});
```

### 2. Create a Writing Circle

```typescript
import { createCircle } from './lib/circles';

const circle = await createCircle('circle-id', {
  name: "Creative Writers Circle",
  cadence_hours: 48,
  member_ids: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
  created_by: currentUserId
});
```

### 3. Start a New Story

```typescript
import { createStory } from './lib/stories';
import { initializeStoryRotation } from './lib/rotation-engine';

const story = await createStory('story-id', {
  circle_id: 'circle-id',
  owner_id: currentUserId,
  title: "The Mysterious Door"
});

const result = await initializeStoryRotation(story.id);
if (result.success) {
  console.log('First assignment created:', result.nextAssignmentId);
}
```

### 4. Submit an Entry and Rotate

```typescript
import { submitEntryAndRotate } from './lib/rotation-engine';
import { markAssignmentSubmitted } from './lib/assignments';

const result = await submitEntryAndRotate(
  currentUserId,
  storyId,
  roundNumber,
  "The door creaked open, revealing a dimly lit corridor..."
);

if (result.success) {
  const assignmentId = `${currentUserId}_${storyId}_${roundNumber}`;
  await markAssignmentSubmitted(assignmentId);
  console.log('Next assignment:', result.nextAssignmentId);
} else {
  console.error('Submission failed:', result.error);
}
```

### 5. Get User's Pending Assignments

```typescript
import { getUserAssignments, getActiveAssignments } from './lib/assignments';

const activeAssignments = await getActiveAssignments(currentUserId);

activeAssignments.forEach(assignment => {
  console.log(`Story: ${assignment.story_id}`);
  console.log(`Due: ${assignment.due_at.toDate()}`);
  console.log(`Round: ${assignment.round_number}`);
});
```

### 6. Read a Complete Story

```typescript
import { getStoryEntries, getFullStoryText } from './lib/entries';

const entries = await getStoryEntries(storyId);
const fullText = getFullStoryText(entries);

console.log(fullText);
```

### 7. Check if Deadline Passed

```typescript
import { isDeadlinePassed, getTimeUntilDeadline } from './lib/rotation-engine';

const assignment = await getAssignment(assignmentId);

if (isDeadlinePassed(assignment.due_at)) {
  console.log('Deadline has passed - no submission allowed');
} else {
  const msRemaining = getTimeUntilDeadline(assignment.due_at);
  const hoursRemaining = msRemaining / (1000 * 60 * 60);
  console.log(`${hoursRemaining.toFixed(1)} hours remaining`);
}
```

## Module Overview

### `firestore-collections.ts`
Typed collection references for all Firestore collections.

### `users.ts`
- `createUser()` - Create user profile
- `getUser()` - Fetch user by ID
- `updateUserNotificationPreferences()` - Update notification settings

### `circles.ts`
- `createCircle()` - Create new writing circle (auto-shuffles rotation)
- `getCircle()` - Fetch circle by ID
- `getUserCircles()` - Get all circles user belongs to
- `updateCircleName()` - Rename a circle
- `getNextWriterInRotation()` - Calculate next writer based on round

### `stories.ts`
- `createStory()` - Start new story in a circle
- `getStory()` - Fetch story by ID
- `getCircleStories()` - Get all stories in a circle (optionally filter by status)
- `getUserStories()` - Get stories created by user
- `updateStoryStatus()` - Mark story as complete
- `incrementStoryRound()` - Move to next round

### `entries.ts`
- `createEntry()` - Submit writing entry (validates length)
- `getEntry()` - Fetch entry by ID
- `getStoryEntries()` - Get all entries for a story (ordered by round)
- `getEntryForRound()` - Get specific round's entry
- `getUserEntries()` - Get all entries by user
- `getFullStoryText()` - Compile entries into readable text

### `assignments.ts`
- `createAssignment()` - Create new writing assignment
- `getAssignment()` - Fetch assignment by ID
- `getUserAssignments()` - Get user's assignments (optionally filter by submitted)
- `getStoryAssignments()` - Get all assignments for a story
- `markAssignmentSubmitted()` - Mark assignment as complete
- `getActiveAssignments()` - Get user's pending assignments before deadline
- `getOverdueAssignments()` - Get user's missed assignments
- `calculateDueDate()` - Calculate deadline based on circle cadence
- `generateAssignmentId()` - Create consistent assignment ID

### `rotation-engine.ts`
Core workflow orchestration:
- `submitEntryAndRotate()` - Submit entry and create next assignment (atomic operation)
- `initializeStoryRotation()` - Create first assignment for new story
- `isDeadlinePassed()` - Check if deadline has passed
- `getTimeUntilDeadline()` - Get milliseconds until deadline
- `shouldStoryComplete()` - Check if story has completed full rotation

## Error Handling

All functions may throw errors. Always wrap in try-catch:

```typescript
try {
  await createEntry(entryId, entryData);
} catch (error) {
  if (error instanceof Error) {
    console.error('Entry creation failed:', error.message);
  }
}
```

The `rotation-engine` functions return result objects instead:

```typescript
const result = await submitEntryAndRotate(...);
if (!result.success) {
  console.error('Rotation failed:', result.error);
}
```

## Type Safety

All functions are fully typed. Import types as needed:

```typescript
import type { 
  User, 
  Circle, 
  Story, 
  Entry, 
  Assignment,
  CreateUserData,
  CreateCircleData,
  CreateStoryData,
  CreateEntryData,
  CreateAssignmentData
} from '../types/firestore';
```

## Security Notes

- All operations respect Firestore security rules
- Users can only submit entries for their own assignments
- Deadlines are enforced both client-side and in security rules
- Entry content is validated (1-1200 characters)
- Circle size is enforced (6-8 members)
