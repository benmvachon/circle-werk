# Firestore Data Structure - Circle Werk

This document describes the Firestore database schema for the Circle Werk rotating writing exercise application.

## Overview

Circle Werk is a private group writing application where 6–8 users participate in a structured, rotating writing exercise. The system assigns each user a story every 48 hours (configurable), enforces strict deadlines, maintains anonymity during the active cycle, and compiles contributions into continuous, readable stories.

## Collections

### `users`

Stores user profile information linked to Firebase Authentication.

**Document ID**: Firebase Auth UID

**Fields**:
- `id` (string): User's Firebase Auth UID
- `name` (string): Display name
- `email` (string): User's email address
- `notification_preferences` (object):
  - `email_enabled` (boolean): Whether email notifications are enabled
  - `push_enabled` (boolean): Whether push notifications are enabled
  - `reminder_hours_before_deadline` (number): Hours before deadline to send reminder
- `created_at` (timestamp): Account creation time
- `updated_at` (timestamp): Last profile update time

**Indexes**: None required (single document reads by ID)

**Security Rules**:
- Read: Any authenticated user
- Create: Only the user themselves (must match auth UID and email)
- Update: Only the user themselves (cannot change email)
- Delete: Only the user themselves

---

### `circles`

Represents a writing group with 6–8 members.

**Document ID**: Auto-generated or custom ID

**Fields**:
- `id` (string): Circle identifier
- `name` (string): Circle name
- `cadence_hours` (number): Hours between rounds (default: 48)
- `start_at` (timestamp): When the circle's first round begins
- `member_ids` (array<string>): Array of user IDs in the circle
- `rotation_order` (array<string>): Randomized order of writers (set once at creation)
- `created_by` (string): User ID of circle creator
- `created_at` (timestamp): Circle creation time
- `updated_at` (timestamp): Last update time

**Indexes**:
- Composite: `member_ids` (array-contains) + `created_at` (desc)

**Security Rules**:
- Read: Only circle members
- Create: Authenticated users (must have 6–8 members, creator must be a member)
- Update: Circle members (cannot change member_ids, rotation_order, or created_by)
- Delete: Only the circle creator

**Business Logic**:
- `rotation_order` is shuffled once at creation and never changes
- Circle size is enforced at 6–8 members

---

### `stories`

Represents a collaborative story within a circle.

**Document ID**: Auto-generated or custom ID

**Fields**:
- `id` (string): Story identifier
- `circle_id` (string): Reference to parent circle
- `owner_id` (string): User who initiated the story
- `status` (string): "active" or "complete"
- `title` (string, optional): Story title
- `current_round` (number): Current round number (0-indexed)
- `created_at` (timestamp): Story creation time
- `updated_at` (timestamp): Last update time
- `completed_at` (timestamp, optional): When story was marked complete

**Indexes**:
- Composite: `circle_id` + `status` + `created_at` (desc)
- Composite: `owner_id` + `created_at` (desc)

**Security Rules**:
- Read: Circle members only
- Create: Circle members (must set status to "active", current_round to 0)
- Update: Circle members (cannot change owner_id or circle_id)
- Delete: Not allowed

**Business Logic**:
- Stories start at round 0
- `current_round` increments after each submission
- Story typically completes after all members have contributed once

---

### `entries`

Individual writing contributions to stories.

**Document ID**: `{story_id}_{round_number}` (recommended pattern)

**Fields**:
- `id` (string): Entry identifier
- `story_id` (string): Reference to parent story
- `user_id` (string): Author of the entry
- `round_number` (number): Which round this entry belongs to
- `content` (string): The actual writing (max 1200 characters)
- `created_at` (timestamp): Submission time
- `locked_at` (timestamp): Deadline for this entry

**Indexes**:
- Composite: `story_id` + `round_number` (asc)
- Composite: `story_id` + `created_at` (asc)
- Composite: `user_id` + `created_at` (desc)

**Security Rules**:
- Read: Circle members only
- Create: Must be assigned user, content 1–1200 chars, before deadline, assignment not yet submitted
- Update: Not allowed (entries are immutable)
- Delete: Not allowed

**Business Logic**:
- Content is limited to 1200 characters
- Entries cannot be edited after submission
- Must be submitted before `locked_at` deadline
- One entry per round per story

---

### `assignments`

Tracks who should write for which story and when.

**Document ID**: `{user_id}_{story_id}_{round_number}` (recommended pattern)

**Fields**:
- `id` (string): Assignment identifier
- `user_id` (string): Assigned writer
- `story_id` (string): Story to write for
- `circle_id` (string): Circle this assignment belongs to
- `round_number` (number): Which round this assignment is for
- `assigned_at` (timestamp): When assignment was created
- `due_at` (timestamp): Deadline for submission
- `submitted` (boolean): Whether entry has been submitted
- `submitted_at` (timestamp, optional): When entry was submitted

**Indexes**:
- Composite: `user_id` + `due_at` (asc)
- Composite: `user_id` + `submitted` + `due_at` (asc)
- Composite: `story_id` + `round_number` (asc)
- Composite: `circle_id` + `due_at` (asc)

**Security Rules**:
- Read: Assigned user or any circle member
- Create: Circle members (must set submitted to false)
- Update: Assigned user only (can only change submitted field, all other fields immutable)
- Delete: Not allowed

**Business Logic**:
- Created when a story starts or after each entry submission
- `due_at` calculated as: `circle.start_at + (round_number * circle.cadence_hours)`
- No late submissions allowed
- Assignment marked submitted when entry is created

---

## Data Flow

### 1. Circle Creation
1. User creates a circle with 6–8 members
2. System randomizes `rotation_order` once
3. Circle is ready for stories

### 2. Story Initialization
1. Circle member creates a story
2. System creates first assignment for `rotation_order[0]`
3. Due date calculated based on circle's `start_at` and `cadence_hours`

### 3. Writing Rotation
1. Assigned user submits entry before deadline
2. System creates entry document
3. Story's `current_round` increments
4. New assignment created for next writer in rotation
5. Process repeats until story is complete

### 4. Story Completion
- Story marked "complete" when desired (typically after all members contribute)
- All entries remain accessible to circle members
- Entries can be compiled in order to read the full story

---

## Key Constraints

1. **Circle Size**: 6–8 members (enforced in security rules)
2. **Entry Length**: 1–1200 characters (enforced in security rules)
3. **Deadlines**: Strictly enforced, no late submissions
4. **Immutability**: Entries cannot be edited or deleted once submitted
5. **Rotation Order**: Set once at circle creation, never changes
6. **Anonymity**: During active rounds, only the assigned writer knows who writes next

---

## Query Patterns

### Get user's pending assignments
```typescript
query(assignments, 
  where("user_id", "==", userId),
  where("submitted", "==", false),
  orderBy("due_at", "asc")
)
```

### Get all entries for a story (in order)
```typescript
query(entries,
  where("story_id", "==", storyId),
  orderBy("round_number", "asc")
)
```

### Get active stories in a circle
```typescript
query(stories,
  where("circle_id", "==", circleId),
  where("status", "==", "active"),
  orderBy("created_at", "desc")
)
```

### Get user's circles
```typescript
query(circles,
  where("member_ids", "array-contains", userId),
  orderBy("created_at", "desc")
)
```

---

## Helper Functions

The following helper modules are available in `/src/lib/`:

- **`users.ts`**: User profile management
- **`circles.ts`**: Circle creation and management
- **`stories.ts`**: Story lifecycle management
- **`entries.ts`**: Entry submission and retrieval
- **`assignments.ts`**: Assignment tracking and queries
- **`rotation-engine.ts`**: Core rotation logic and workflow orchestration

---

## Deployment

To deploy the Firestore configuration:

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

---

## Future Enhancements

Potential features to consider:

1. **Notifications**: Cloud Functions to send reminders before deadlines
2. **Story Templates**: Pre-defined story starters or prompts
3. **Analytics**: Track participation rates, average entry length, etc.
4. **Story Export**: Generate PDF or ePub of completed stories
5. **Multiple Circles**: Allow users to participate in multiple circles
6. **Custom Cadences**: Different cadence_hours per story
