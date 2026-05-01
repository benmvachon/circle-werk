import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CirclesPage } from '../pages/CirclesPage';
import { CircleDetailPage } from '../pages/CircleDetailPage';
import { StoryDetailPage } from '../pages/StoryDetailPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'circles',
        element: (
          <ProtectedRoute>
            <CirclesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'circles/:circleId',
        element: (
          <ProtectedRoute>
            <CircleDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'stories/:storyId',
        element: (
          <ProtectedRoute>
            <StoryDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assignments',
        element: (
          <ProtectedRoute>
            <AssignmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
