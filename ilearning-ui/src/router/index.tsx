import { createBrowserRouter, Navigate } from 'react-router';
import RouteError from '@/components/RouteError';
import MainLayout from '@/layouts/MainLayout';
import { APP_ROUTES } from '@/router/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: APP_ROUTES[0].element },
      ...APP_ROUTES.slice(1).map((route) => ({
        path: route.path.slice(1),
        element: route.element,
      })),
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
