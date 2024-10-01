import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getAuth } from 'firebase/auth';
import { fetchUserProfile, updateUserProfile } from '../components/user';

const ProfileField = ({ label, name, value, onChange, editMode }) => (
  <Grid item xs={12}>
    {editMode ? (
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />
    ) : (
      <Typography variant="body1">
        <strong>{label}:</strong> {value || 'N/A'}
      </Typography>
    )}
  </Grid>
);

const Profile = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    userName: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const token = await user.getIdToken();
          const data = await fetchUserProfile(token);
          setProfileData({
            userName: data.userName || '',
            displayName: data.displayName || '',
            email: data.email || user.email,
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
          });
        } catch (error) {
          setError('Error loading profile data');
          console.error(error);
        } finally {
          setLoading(false);
        }
      }

      setLoading(false);
    };

    loadUserProfile();
  }, [auth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => setEditMode((prev) => !prev);

  const handleSave = async () => {
    setSaving(true);
    const token = await auth.currentUser.getIdToken();
    try {
      const response = await updateUserProfile(token, profileData);
      console.log(response);
      setEditMode(false);
    } catch (error) {
      setError('Error saving profile data');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const { userName, displayName, email, phone, address, city } = profileData;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: theme.spacing(4) }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80 }}>
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Box>
        <Typography variant="h4" align="center" gutterBottom sx={{mb:4}}>
          {userName || displayName || 'User Profile'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <ProfileField label="Username" name="userName" value={userName} onChange={handleInputChange} editMode={editMode} />
          <ProfileField label="Full Name" name="displayName" value={displayName} onChange={handleInputChange} editMode={editMode} />
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Email:</strong> {email}
            </Typography>
          </Grid>
          <ProfileField label="Phone" name="phone" value={phone} onChange={handleInputChange} editMode={editMode} />
          <ProfileField label="Address" name="address" value={address} onChange={handleInputChange} editMode={editMode} />
          <ProfileField label="City" name="city" value={city} onChange={handleInputChange} editMode={editMode} />

          <Grid item xs={12}>
            {editMode ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleEditToggle} fullWidth>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleEditToggle} fullWidth sx={{ mt: 1 }}>
                Edit Profile
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
