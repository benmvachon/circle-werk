# Context Providers

## AuthContext

Manages Firebase Authentication state throughout the application.

### Usage

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  // user: Firebase User object or null
  // loading: boolean indicating auth check in progress
  // signOut: async function to sign out current user
}
```

### Properties

- **`user`** - Current authenticated Firebase user or `null`
- **`loading`** - `true` while checking authentication state
- **`signOut`** - Async function to sign out the current user

### Example: Display User Email

```typescript
function UserInfo() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Logged in as: {user.email}</div>;
}
```

### Example: Conditional Rendering

```typescript
function MyComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user ? (
        <div>Welcome back!</div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### Example: Sign Out

```typescript
function SignOutButton() {
  const { signOut } = useAuth();
  
  const handleClick = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  return <button onClick={handleClick}>Sign Out</button>;
}
```

## Setup

The AuthProvider is already configured in the AppRouter:

```typescript
// src/routes/index.tsx
export function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

No additional setup required - just use the `useAuth()` hook anywhere in your app.
