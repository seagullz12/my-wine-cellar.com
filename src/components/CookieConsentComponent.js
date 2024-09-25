// src/components/CookieConsentComponent.js
import React, { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Modal, Button, Typography, Box } from '@mui/material';

const CookieConsentComponent = () => {
  const [openModal, setOpenModal] = useState(false);
  const [acceptedPreferences, setAcceptedPreferences] = useState({
    functional: true, // Generally accepted
    analytics: false,
    marketing: false,
  });

  const handleAccept = () => {
    // Logic to accept cookies
    setOpenModal(false);
    // Set cookies based on acceptedPreferences
    document.cookie = `my-wine-cellar-cookie=true; max-age=31536000; path=/;`;
    // Optionally, you can call functions to enable specific cookies here.
  };

  const handleReject = () => {
    setOpenModal(false);
    // Set cookies to reject all non-essential cookies
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
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        declineButtonStyle={{ fontSize: "13px", marginLeft: "10px" }}
        expires={150}
      >
        This website uses cookies to enhance your experience and analyze site traffic. By clicking "I understand", you consent to our use of cookies. You can customize your preferences by clicking the button below.
        <div style={{ marginTop: '10px' }}>
          <button onClick={handlePreferences} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#4e503b', cursor: 'pointer' }}>
            Customize Preferences
          </button>
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
            <label>
              <input
                type="checkbox"
                name="functional"
                checked={acceptedPreferences.functional}
                onChange={handlePreferenceChange}
                disabled
              />
              &nbsp;Functional Cookies (essential for website functionality)
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="analytics"
                checked={acceptedPreferences.analytics}
                onChange={handlePreferenceChange}
              />
              &nbsp;Analytics Cookies (help us understand how users interact with our site)
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="marketing"
                checked={acceptedPreferences.marketing}
                onChange={handlePreferenceChange}
              />
              &nbsp;Marketing Cookies (used for advertising and tracking)
            </label>
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
