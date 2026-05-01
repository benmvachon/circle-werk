# Routing Configuration

This directory contains the routing setup for Circle Werk using React Router v6.

## Structure

- **`router.tsx`** - Route definitions and configuration
- **`index.tsx`** - Main AppRouter component export
- **`Layout.tsx`** - Root layout with navigation
- **`hooks.ts`** - Custom routing hooks for common patterns

## Routes

### Public Routes (No Authentication Required)

- **`/login`** - User login page
- **`/register`** - User registration page

### Protected Routes (Authentication Required)

- **`/`** - Home page
- **`/circles`** - List of user's circles
- **`/circles/:circleId`** - Circle detail view
- **`/stories/:storyId`** - Story detail view with entries
- **`/assignments`** - User's writing assignments
- **`/profile`** - User profile and settings
- **`*`** - 404 Not Found page

## URL Parameters

### Path Parameters

```typescript
const { circleId } = useParams();
const { storyId } = useParams();
```

### Query Parameters

```typescript
const [searchParams] = useSearchParams();
const round = searchParams.get('round');
```

## Custom Hooks

### useCircleId()
Extract circle ID from URL params.

### useStoryId()
Extract story ID from URL params.

### useRoundParam()
Extract round number from query params.

### useNavigateToCircle()
Navigate to a circle detail page.

### useNavigateToStory()
Navigate to a story detail page with optional round.

### useNavigateToAssignments()
Navigate to assignments page.

## Usage Example

```typescript
import { AppRouter } from './routes';

function App() {
  return <AppRouter />;
}
```
