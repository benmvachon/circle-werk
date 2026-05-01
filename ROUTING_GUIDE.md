# Circle Werk - Routing Guide

Complete guide to routing and URL parameter handling in Circle Werk.

## Installation

React Router DOM has been installed:

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

## Quick Start

### 1. Update main.tsx

Replace your App component with the AppRouter:

```typescript
import { AppRouter } from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
```

### 2. Available Routes

| Route | Description | Parameters |
|-------|-------------|------------|
| `/` | Home page | - |
| `/circles` | List of circles | - |
| `/circles/:circleId` | Circle detail | `circleId` (path) |
| `/stories/:storyId` | Story detail | `storyId` (path), `round` (query) |
| `/assignments` | User assignments | - |
| `/profile` | User profile | - |

## Working with URL Parameters

### Path Parameters

Extract IDs from the URL path:

```typescript
import { useParams } from 'react-router-dom';

function CircleDetailPage() {
  const { circleId } = useParams<{ circleId: string }>();
  
  // Use circleId to fetch circle data
  const circle = await getCircle(circleId!);
}
```

### Query Parameters

Extract parameters from the query string:

```typescript
import { useSearchParams } from 'react-router-dom';

function StoryDetailPage() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get('round');
  
  // URL: /stories/abc123?round=5
  // round = "5"
}
```

### Custom Hooks

Use the provided custom hooks for cleaner code:

```typescript
import { useCircleId, useStoryId, useRoundParam } from './routes/hooks';

function MyComponent() {
  const circleId = useCircleId();      // From /circles/:circleId
  const storyId = useStoryId();        // From /stories/:storyId
  const round = useRoundParam();       // From ?round=5
}
```

## Navigation

### Using Link Components

```typescript
import { Link } from 'react-router-dom';

function CirclesList() {
  return (
    <div>
      <Link to="/circles/abc123">View Circle</Link>
      <Link to="/stories/xyz789?round=3">View Story Round 3</Link>
    </div>
  );
}
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/circles/abc123');
  };
  
  const handleStoryClick = (storyId: string, round: number) => {
    navigate(`/stories/${storyId}?round=${round}`);
  };
}
```

### Custom Navigation Hooks

```typescript
import { 
  useNavigateToCircle, 
  useNavigateToStory,
  useNavigateToAssignments 
} from './routes/hooks';

function MyComponent() {
  const navigateToCircle = useNavigateToCircle();
  const navigateToStory = useNavigateToStory();
  const navigateToAssignments = useNavigateToAssignments();
  
  navigateToCircle('circle-id');
  navigateToStory('story-id', 5);  // With round number
  navigateToAssignments();
}
```

## Common Patterns

### Fetching Data Based on URL

```typescript
import { useEffect, useState } from 'react';
import { useStoryId, useRoundParam } from './routes/hooks';
import { getStory, getStoryEntries } from './lib';

function StoryDetailPage() {
  const storyId = useStoryId();
  const round = useRoundParam();
  const [story, setStory] = useState(null);
  
  useEffect(() => {
    if (storyId) {
      getStory(storyId).then(setStory);
    }
  }, [storyId]);
  
  if (!story) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{story.title}</h1>
      {round && <p>Viewing Round {round}</p>}
    </div>
  );
}
```

### Building Dynamic Links

```typescript
function StoryRoundSelector({ storyId, totalRounds }: Props) {
  return (
    <div>
      {Array.from({ length: totalRounds }, (_, i) => (
        <Link 
          key={i} 
          to={`/stories/${storyId}?round=${i}`}
        >
          Round {i}
        </Link>
      ))}
    </div>
  );
}
```

### Conditional Redirects

```typescript
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  const user = useAuthUser();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <div>Protected content</div>;
}
```

## Integration with Firestore

### Example: Circle Detail Page

```typescript
import { useEffect, useState } from 'react';
import { useCircleId } from './routes/hooks';
import { getCircle, getCircleStories } from './lib';
import type { Circle, Story } from './types';

export function CircleDetailPage() {
  const circleId = useCircleId();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  
  useEffect(() => {
    if (!circleId) return;
    
    Promise.all([
      getCircle(circleId),
      getCircleStories(circleId, 'active')
    ]).then(([circleData, storiesData]) => {
      setCircle(circleData);
      setStories(storiesData);
    });
  }, [circleId]);
  
  if (!circle) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{circle.name}</h1>
      <p>Members: {circle.member_ids.length}</p>
      
      <h2>Active Stories</h2>
      {stories.map(story => (
        <Link key={story.id} to={`/stories/${story.id}`}>
          {story.title || 'Untitled Story'}
        </Link>
      ))}
    </div>
  );
}
```

### Example: Story with Round Navigation

```typescript
import { useStoryId, useRoundParam, useNavigateToStory } from './routes/hooks';
import { getStory, getStoryEntries } from './lib';

export function StoryDetailPage() {
  const storyId = useStoryId();
  const currentRound = useRoundParam();
  const navigateToStory = useNavigateToStory();
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    if (storyId) {
      getStoryEntries(storyId).then(setEntries);
    }
  }, [storyId]);
  
  const handleRoundChange = (round: number) => {
    if (storyId) {
      navigateToStory(storyId, round);
    }
  };
  
  const displayRound = currentRound ?? entries.length - 1;
  const entry = entries.find(e => e.round_number === displayRound);
  
  return (
    <div>
      <select 
        value={displayRound} 
        onChange={(e) => handleRoundChange(Number(e.target.value))}
      >
        {entries.map((_, i) => (
          <option key={i} value={i}>Round {i}</option>
        ))}
      </select>
      
      {entry && (
        <div>
          <p>{entry.content}</p>
        </div>
      )}
    </div>
  );
}
```

## File Structure

```
src/
├── routes/
│   ├── index.tsx          # AppRouter component
│   ├── router.tsx         # Route definitions
│   ├── Layout.tsx         # Root layout with nav
│   ├── hooks.ts           # Custom routing hooks
│   └── README.md          # Routing documentation
├── pages/
│   ├── HomePage.tsx
│   ├── CirclesPage.tsx
│   ├── CircleDetailPage.tsx
│   ├── StoryDetailPage.tsx
│   ├── AssignmentsPage.tsx
│   ├── ProfilePage.tsx
│   └── NotFoundPage.tsx
└── lib/
    └── ...                # Firestore helpers
```

## Next Steps

1. Update `src/main.tsx` to use `<AppRouter />`
2. Implement page components with actual Firestore data
3. Add authentication guards for protected routes
4. Style the navigation and layout components
5. Add loading states and error boundaries
