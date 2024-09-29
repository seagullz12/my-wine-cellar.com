import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, sendPasswordResetEmail } from '../components/firebase-config';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Snackbar,
  Alert
} from '@mui/material';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Reset email sent successfully to', email);
      setResetMessage('Password reset email sent! Please check your inbox.');
      setError('');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError('Failed to send reset email. Please make sure the email is correct.');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Reset Password
        </Typography>
        <form onSubmit={handlePasswordReset}>
          <TextField
            variant="outlined"
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Send Reset Email
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {resetMessage && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              {resetMessage}
            </Typography>
          )}
        </form>
        <Button
          variant="text"
          onClick={() => navigate('/#/signin')}
          sx={{ mt: 2 }}
        >
          Remembered your password? Sign In
        </Button>
      </Box>
      
      {/* Snackbar for success message */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {resetMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PasswordReset;
