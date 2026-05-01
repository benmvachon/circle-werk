import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '../pages/HomePage';
import { CirclesPage } from '../pages/CirclesPage';
import { CircleDetailPage } from '../pages/CircleDetailPage';
import { StoryDetailPage } from '../pages/StoryDetailPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'circles',
        element: <CirclesPage />,
      },
      {
        path: 'circles/:circleId',
        element: <CircleDetailPage />,
      },
      {
        path: 'stories/:storyId',
        element: <StoryDetailPage />,
      },
      {
        path: 'assignments',
        element: <AssignmentsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
