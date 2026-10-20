import { createBrowserRouter, Navigate } from 'react-router';
import RouteError from '@/components/RouteError';
import MainLayout from '@/layouts/MainLayout';
import { LoginGate, RequireAuth, RequireRole } from '@/router/guards';
import { APP_ROUTES } from '@/router/routes';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginGate />,
    errorElement: <RouteError />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: APP_ROUTES[0].element },
          ...APP_ROUTES.slice(1).map((route) => ({
            path: route.path.slice(1),
            element: route.roles ? (
              <RequireRole roles={route.roles}>{route.element}</RequireRole>
            ) : (
              route.element
            ),
          })),
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
