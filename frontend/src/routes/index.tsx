import { useEffect } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { RoomPage } from '../pages/room/RoomPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ToastViewport } from '../components/feedback/Toast';
import { useAuthStore } from '../store/auth.store';
import { PageTransition } from '../components/layout/PageTransition';

const TransitionOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode='wait'>
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
};

const AppLayout = () => {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (localStorage.getItem('access_token')) void fetchMe();
  }, [fetchMe]);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <TransitionOutlet />
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
