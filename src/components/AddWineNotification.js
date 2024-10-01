import React from 'react';
import { Snackbar, SnackbarContent, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

const AddWineNotification = ({ open, message, onClose, wineUrl }) => {
  const theme = useTheme();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={600000} // Duration for auto-hide
      onClose={handleClose}
    >
      <SnackbarContent
        sx={{
          backgroundColor: theme.palette.success.light,
          color: theme.palette.common.white,
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2),
          borderRadius: '8px', // Rounded corners
          boxShadow: 3, // Shadow effect
        }}
        message={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon style={{ marginRight: theme.spacing(1) }} />
            <Typography variant="body4" style={{ fontWeight: 'bold', textAlign:"left" }}>
              {message}
            </Typography>
            <Button
              color="inherit"
              onClick={() => window.open(wineUrl, '_blank')}
              sx={{ marginLeft: theme.spacing(2), textTransform: 'capitalize', borderRadius: '4px' }}
              variant="outlined" // Outlined button
            >
              View
            </Button>
          </span>
        }
        action={[
          <Button color="inherit" onClick={handleClose} key="close">
            <CloseIcon />
          </Button>,
        ]}
      />
    </Snackbar>
  );
};

export default AddWineNotification;
