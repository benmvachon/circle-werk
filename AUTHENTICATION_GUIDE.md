# Circle Werk - Authentication Guide

Complete guide to authentication and route protection in Circle Werk.

## Overview

Circle Werk uses Firebase Authentication with email/password sign-in. All routes except login and register are protected and require authentication.

## Authentication Flow

### 1. User Registration
- Navigate to `/register`
- User provides name, email, and password
- Firebase creates authentication account
- User profile created in Firestore `users` collection
- Automatically redirected to home page

### 2. User Login
- Navigate to `/login`
- User provides email and password
- Firebase authenticates credentials
- Redirected to home page

### 3. Protected Routes
- All main app routes require authentication
- Unauthenticated users redirected to `/login`
- Authentication state persists across page refreshes

### 4. Sign Out
- Click "Sign Out" button in navigation
- Firebase signs out user
- Redirected to `/login`

## Route Protection

### Public Routes (No Auth Required)
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Auth Required)
- `/` - Home page
- `/circles` - Circles list
- `/circles/:circleId` - Circle detail
- `/stories/:storyId` - Story detail
- `/assignments` - User assignments
- `/profile` - User profile

## Components

### AuthProvider
Context provider that manages authentication state.

**Location**: `src/contexts/AuthContext.tsx`

**Provides**:
- `user` - Current Firebase user or null
- `loading` - Loading state during auth check
- `signOut` - Function to sign out user

**Usage**:
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

### ProtectedRoute
Wrapper component that requires authentication.

**Location**: `src/components/ProtectedRoute.tsx`

**Behavior**:
- Shows loading screen while checking auth
- Redirects to `/login` if not authenticated
- Renders children if authenticated

**Usage**:
```typescript
<ProtectedRoute>
  <MyProtectedPage />
</ProtectedRoute>
```

### PublicRoute
Wrapper component for login/register pages.

**Location**: `src/components/PublicRoute.tsx`

**Behavior**:
- Shows loading screen while checking auth
- Redirects to `/` if already authenticated
- Renders children if not authenticated

**Usage**:
```typescript
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

## Pages

### LoginPage
Email/password login form.

**Location**: `src/pages/LoginPage.tsx`

**Features**:
- Email and password inputs
- Error handling and display
- Loading state during sign in
- Link to registration page

### RegisterPage
User registration form.

**Location**: `src/pages/RegisterPage.tsx`

**Features**:
- Name, email, and password inputs
- Password confirmation
- Validation (min 6 characters, passwords match)
- Creates user profile in Firestore
- Error handling and display
- Loading state during registration
- Link to login page

## Integration with Firestore

When a user registers, a profile is automatically created:

```typescript
// In RegisterPage.tsx
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

await createUser(userCredential.user.uid, {
  name,
  email,
});
```

This creates a document in the `users` collection with:
- `id` - Firebase Auth UID
- `name` - User's display name
- `email` - User's email
- `notification_preferences` - Default notification settings
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Using Auth in Components

### Get Current User

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  return <div>User ID: {user?.uid}</div>;
}
```

### Check Auth State

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Checking authentication...</div>;
  }
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome!</div>;
}
```

### Sign Out User

```typescript
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

### Fetch User Profile

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getUser } from './lib/users';
import type { User } from './types';

function ProfileComponent() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  
  useEffect(() => {
    if (authUser) {
      getUser(authUser.uid).then(setProfile);
    }
  }, [authUser]);
  
  if (!profile) return <div>Loading profile...</div>;
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.email}</p>
    </div>
  );
}
```

## Security Rules Integration

The Firestore security rules enforce authentication:

```javascript
// Users can only read their own profile
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isOwner(userId);
  allow update: if isOwner(userId);
}

// Circle members can read circle data
match /circles/{circleId} {
  allow read: if isAuthenticated() && 
                 request.auth.uid in resource.data.member_ids;
}
```

## Error Handling

### Common Firebase Auth Errors

```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    setError('No account found with this email');
  } else if (error.code === 'auth/wrong-password') {
    setError('Incorrect password');
  } else if (error.code === 'auth/invalid-email') {
    setError('Invalid email address');
  } else {
    setError('Failed to sign in');
  }
}
```

### Registration Errors

```typescript
try {
  await createUserWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/email-already-in-use') {
    setError('Email already registered');
  } else if (error.code === 'auth/weak-password') {
    setError('Password is too weak');
  } else {
    setError('Failed to create account');
  }
}
```

## Testing Authentication

### Manual Testing Steps

1. **Registration Flow**:
   - Go to `/register`
   - Fill in name, email, password
   - Submit form
   - Verify redirect to home page
   - Check Firestore for user document

2. **Login Flow**:
   - Sign out if logged in
   - Go to `/login`
   - Enter credentials
   - Submit form
   - Verify redirect to home page

3. **Route Protection**:
   - Sign out
   - Try to access `/circles`
   - Verify redirect to `/login`
   - Sign in
   - Verify access granted

4. **Sign Out**:
   - Click "Sign Out" button
   - Verify redirect to `/login`
   - Try to access protected route
   - Verify redirect to `/login`

## Best Practices

1. **Always check loading state** before rendering auth-dependent content
2. **Use ProtectedRoute** for all routes requiring authentication
3. **Handle errors gracefully** with user-friendly messages
4. **Never expose sensitive data** in client-side code
5. **Validate user input** before submitting to Firebase
6. **Use TypeScript types** for type safety with user objects

## Next Steps

1. Add password reset functionality
2. Implement email verification
3. Add social authentication providers (Google, GitHub, etc.)
4. Add user profile editing
5. Implement "Remember Me" functionality
6. Add two-factor authentication
