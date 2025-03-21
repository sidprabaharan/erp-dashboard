import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, loading, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required');
      return;
    }
    
    setFormError('');
    
    // Attempt login
    const success = await login(username, password);
    if (success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4 }}>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ '& .MuiTextField-root': { mb: 2 } }}
          >
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              ERP Dashboard
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
              Sign in to your account
            </Typography>
            
            {(error || formError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError || error}
              </Alert>
            )}
            
            <TextField
              label="Username or Email"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box mt={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  Demo credentials: <strong>admin</strong> / <strong>Admin@123</strong>
                </Typography>
              </Alert>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
