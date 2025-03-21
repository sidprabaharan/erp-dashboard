import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required roles (if any)
  if (requiredRoles.length > 0) {
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required roles
  return children;
};

export default ProtectedRoute;
