import React, { createContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token validity
        const decodedToken = jwt_decode(token);
        
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired, remove from storage
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Set user from token
          setUser({
            id: decodedToken.nameid,
            username: decodedToken.unique_name,
            email: decodedToken.email,
            roles: decodedToken.role,
            token
          });
        }
      } catch (err) {
        console.error('Invalid token', err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginUser(username, password);
      const { token, roles, ...userData } = response;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser({
        ...userData,
        roles,
        token
      });
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    
    // Handle single role or array of roles
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    } else {
      return user.roles === role;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      hasRole,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
