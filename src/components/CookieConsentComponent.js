import React, { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Modal, Button, Typography, Box, Checkbox, FormControlLabel } from '@mui/material';

const CookieConsentComponent = () => {
  const [openModal, setOpenModal] = useState(false);
  const [acceptedPreferences, setAcceptedPreferences] = useState({
    functional: true, // Generally accepted
    analytics: false,
    marketing: false,
  });

  const handleAccept = () => {
    setOpenModal(false);
    document.cookie = `my-wine-cellar-cookie=true; max-age=31536000; path=/;`;
    // Optionally enable specific cookies based on preferences
  };

  const handleReject = () => {
    setOpenModal(false);
    document.cookie = `my-wine-cellar-cookie=false; max-age=31536000; path=/;`;
  };

  const handlePreferences = () => {
    setOpenModal(true);
  };

  const handlePreferenceChange = (event) => {
    const { name, checked } = event.target;
    setAcceptedPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="I understand"
        declineButtonText="Reject non-essential"
        cookieName="my-wine-cellar-cookie"
        style={{ background: "#2B373B" }}
        variant="contained"
        color="secondary"
        declineButtonStyle={{ fontSize: "13px", marginLeft: "10px" }}
        expires={150}
      >
        This website uses cookies to enhance your experience and analyze site traffic. By clicking "I understand", you consent to our use of cookies. You can customize your preferences by clicking the button below.
        <div style={{ marginTop: '10px' }}>
          <Button 
            onClick={handlePreferences} 
            variant="text" 
            sx={{ color: '#FFF' }}
          >
            Customize Preferences
          </Button>
        </div>
      </CookieConsent>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ 
            width: 400, 
            bgcolor: 'background.paper', 
            p: 4, 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            boxShadow: 24,
            borderRadius: 2 
          }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Cookie Preferences
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please select your cookie preferences:
          </Typography>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="functional"
                  checked={acceptedPreferences.functional}
                  onChange={handlePreferenceChange}
                  disabled
                />
              }
              label="Functional Cookies (essential for website functionality)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="analytics"
                  checked={acceptedPreferences.analytics}
                  onChange={handlePreferenceChange}
                />
              }
              label="Analytics Cookies (help us understand how users interact with our site)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="marketing"
                  checked={acceptedPreferences.marketing}
                  onChange={handlePreferenceChange}
                />
              }
              label="Marketing Cookies (used for advertising and tracking)"
            />
          </Box>
          <Button variant="contained" onClick={handleAccept} sx={{ mr: 1 }}>
            Accept
          </Button>
          <Button variant="outlined" onClick={handleReject}>
            Reject
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default CookieConsentComponent;
