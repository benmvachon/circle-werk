# Circle Werk - Quick Start Guide

Get started with Circle Werk's authentication and routing system.

## 🚀 Running the App

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## 📋 First Steps

### 1. Create an Account
- Navigate to `/register`
- Enter your name, email, and password
- Click "Register"
- You'll be automatically logged in and redirected to the home page

### 2. Explore the App
- **Home** (`/`) - Dashboard view
- **Circles** (`/circles`) - View and manage writing circles
- **Assignments** (`/assignments`) - See your writing assignments
- **Profile** (`/profile`) - Manage your account settings

### 3. Sign Out
- Click "Sign Out" in the navigation bar
- You'll be redirected to the login page

### 4. Sign Back In
- Navigate to `/login`
- Enter your email and password
- Click "Sign In"

## 🔐 Authentication

### Current User
```typescript
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();
console.log(user?.uid);    // Firebase user ID
console.log(user?.email);  // User email
```

### Sign Out
```typescript
import { useAuth } from './contexts/AuthContext';

const { signOut } = useAuth();
await signOut();
```

## 🛣️ Navigation

### Using Links
```typescript
import { Link } from 'react-router-dom';

<Link to="/circles">View Circles</Link>
<Link to="/circles/abc123">View Specific Circle</Link>
<Link to="/stories/xyz789?round=5">View Story Round 5</Link>
```

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/circles');
navigate('/stories/xyz789?round=5');
```

### Custom Hooks
```typescript
import { useNavigateToCircle, useNavigateToStory } from './routes/hooks';

const navigateToCircle = useNavigateToCircle();
const navigateToStory = useNavigateToStory();

navigateToCircle('circle-id');
navigateToStory('story-id', 5);  // With round number
```

## 📊 Firestore Integration

### Fetch User Profile
```typescript
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getUser } from './lib/users';

function MyComponent() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    if (authUser) {
      getUser(authUser.uid).then(setProfile);
    }
  }, [authUser]);
  
  return <div>{profile?.name}</div>;
}
```

### Fetch User's Circles
```typescript
import { getUserCircles } from './lib/circles';

const circles = await getUserCircles(userId);
```

### Fetch User's Assignments
```typescript
import { getUserAssignments, getActiveAssignments } from './lib/assignments';

const allAssignments = await getUserAssignments(userId);
const activeOnly = await getActiveAssignments(userId);
```

## 🗂️ Project Structure

```
src/
├── components/
│   ├── ProtectedRoute.tsx    # Requires authentication
│   └── PublicRoute.tsx        # Redirects if authenticated
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── lib/
│   ├── users.ts               # User operations
│   ├── circles.ts             # Circle operations
│   ├── stories.ts             # Story operations
│   ├── entries.ts             # Entry operations
│   ├── assignments.ts         # Assignment operations
│   └── rotation-engine.ts     # Rotation logic
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── CirclesPage.tsx
│   ├── CircleDetailPage.tsx
│   ├── StoryDetailPage.tsx
│   ├── AssignmentsPage.tsx
│   └── ProfilePage.tsx
├── routes/
│   ├── index.tsx              # AppRouter with AuthProvider
│   ├── router.tsx             # Route definitions
│   ├── Layout.tsx             # Navigation layout
│   └── hooks.ts               # Custom routing hooks
├── types/
│   └── firestore.ts           # TypeScript types
├── firebase.ts                # Firebase config
└── main.tsx                   # App entry point
```

## 📚 Documentation

- **[AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)** - Complete authentication guide
- **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - Routing and URL parameters
- **[FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)** - Database structure
- **[src/lib/README.md](./src/lib/README.md)** - Firestore helper functions
- **[src/routes/README.md](./src/routes/README.md)** - Routing documentation

## 🔧 Common Tasks

### Add a New Protected Page
1. Create page component in `src/pages/`
2. Add route in `src/routes/router.tsx`:
   ```typescript
   {
     path: 'my-page',
     element: (
       <ProtectedRoute>
         <MyPage />
       </ProtectedRoute>
     ),
   }
   ```
3. Add navigation link in `src/routes/Layout.tsx`

### Fetch Data Based on URL
```typescript
import { useStoryId } from './routes/hooks';
import { getStory } from './lib/stories';

function StoryPage() {
  const storyId = useStoryId();
  const [story, setStory] = useState(null);
  
  useEffect(() => {
    if (storyId) {
      getStory(storyId).then(setStory);
    }
  }, [storyId]);
  
  return <div>{story?.title}</div>;
}
```

### Check User Permissions
```typescript
import { useAuth } from './contexts/AuthContext';
import { getCircle } from './lib/circles';

function CirclePage({ circleId }) {
  const { user } = useAuth();
  const [circle, setCircle] = useState(null);
  const [canAccess, setCanAccess] = useState(false);
  
  useEffect(() => {
    getCircle(circleId).then(circle => {
      setCircle(circle);
      setCanAccess(circle.member_ids.includes(user?.uid));
    });
  }, [circleId, user]);
  
  if (!canAccess) return <div>Access denied</div>;
  
  return <div>{circle.name}</div>;
}
```

## 🚨 Troubleshooting

### "Cannot find module" errors
Run: `npm install`

### TypeScript errors
Run: `npm run build` to check for type errors

### Authentication not persisting
Check that AuthProvider wraps your app in `src/routes/index.tsx`

### Routes not working
Verify router is properly configured in `src/routes/router.tsx`

### Firestore permission denied
Check security rules in `firestore.rules` and ensure user is authenticated

## 🎯 Next Steps

1. Implement actual page components with real data
2. Add loading states and error boundaries
3. Style the application with CSS
4. Add form validation
5. Implement password reset
6. Add email verification
7. Create circle management UI
8. Build story writing interface
9. Implement assignment notifications
10. Deploy to Firebase Hosting
