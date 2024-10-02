import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  SnackbarContent,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { updateUserProfile } from '../components/api/user'; // Import the updateUserProfile function

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [displayName, setDisplayName] = useState(''); // New state for username
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // For redirecting after sign-up
  const auth = getAuth();
  const theme = useTheme();
  const [profileData, setProfileData] = useState({
    userName: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create user with Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Prepare user data to update
      const token = await user.getIdToken(); // Get token for authorization
      const userData = {
        email: user.email,
        userName: username,
        displayName: displayName 
        // Add other fields as necessary
      };

      // Call the updateUserProfile function to save additional user data
      await updateUserProfile(token, userData);

      // Indicate success and show snackbar
      setSuccess(true);
      setSnackbarOpen(true);
      navigate('/'); // Redirect to the main page after successful sign-up
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error('Sign Up Error:', error);
      setSnackbarOpen(true); // Open Snackbar on error
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setSuccess(false);
    setError(''); // Reset error on close
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Sign up and join the club!
      </Typography>
      <form onSubmit={handleSignUp}>
      <TextField
          label="Username"  // New input field for username
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
         <TextField
          label="Full Name (optional)" 
          variant="outlined"
          fullWidth
          margin="normal"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
      </form>

      {/* Snackbar for notifications */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <SnackbarContent
          sx={{
            backgroundColor: success ? theme.palette.success.light : theme.palette.error.light,
            color: theme.palette.common.white,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(2),
            borderRadius: '8px', // Rounded corners
            boxShadow: 3, // Shadow effect
          }}
          message={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" style={{ fontWeight: 'bold', textAlign: "left" }}>
                {success ? "You have successfully created your account! Welcome aboard!" : error}
              </Typography>
            </span>
          }
          action={[
            <IconButton color="inherit" onClick={handleCloseSnackbar} key="close" aria-label="close">
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Snackbar>
    </Container>
  );
};

export default SignUp;
