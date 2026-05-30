import { useEffect } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { RoomPage } from '../pages/room/RoomPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ToastViewport, useToastStore } from '../components/feedback/Toast';
import { useAuthStore } from '../store/auth.store';

const AppLayout = () => {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      void fetchMe();
    }
  }, [fetchMe]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Outlet />
      <ToastViewport key={isAuthenticated ? 'auth' : 'guest'} />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'room/:roomId', element: <RoomPage /> },
          { path: 'profile', element: <ProfilePage /> }
        ]
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> }
        ]
      }
    ]
  }
]);
