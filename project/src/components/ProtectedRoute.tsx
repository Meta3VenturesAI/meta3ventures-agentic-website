import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackPath = '/'
}) => {
  const { isAuthenticated, checkAdminAccess, isSessionValid } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if session is still valid
  if (!isSessionValid()) {
    console.log('ProtectedRoute: Session expired, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (requireAdmin && !checkAdminAccess()) {
    console.log('ProtectedRoute: Admin access required but not granted');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
