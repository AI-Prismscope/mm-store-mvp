// src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // While we're checking the session, don't render anything yet
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If there's no user, redirect to the login page.
  // The 'replace' prop prevents the user from hitting "back" to a protected page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If there is a user, render the child route component.
  // <Outlet /> is a placeholder for the nested route component from react-router.
  return <Outlet />;
}
