import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WineBarIcon from '@mui/icons-material/WineBar';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront'; // Import the Marketplace icon
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Import the My Sales icon
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router for navigation
import { useTheme } from '@mui/material/styles'; // To access the theme

const BottomNav = () => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate(); // For navigation between pages
  const theme = useTheme(); // Get the theme

  const handleChange = (event, newValue) => {
    setValue(newValue);

    // Navigation based on the selected menu item
    switch (newValue) {
      case 0:
        navigate('/add-wine');
        break;
      case 1:
        navigate('/cellar');
        break;
      case 2: // Navigate to Personal Sommelier
        navigate('/personal-sommelier');
        break;
      case 3: // Navigate to Marketplace
        navigate('/marketplace');
        break;
      case 4: // Navigate to My Sales
        navigate('/seller/dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.primary.main, // Primary theme color for background
        zIndex: 1000, // Set z-index to ensure it stays above other elements
      }}
      elevation={3} // Adds shadow effect
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction
          label="Add Wine"
          icon={<SearchIcon />}
          sx={{
            color: value === 0 ? theme.palette.secondary.main : theme.palette.text.secondary, // Highlight when active
          }}
        />
        <BottomNavigationAction
          label="My Cellar"
          icon={<WineBarIcon />}
          sx={{
            color: value === 1 ? theme.palette.secondary.main : theme.palette.text.secondary, // Highlight when active
          }}
        />
        <BottomNavigationAction
          label="Sommelier"
          icon={<PersonIcon />}
          sx={{
            color: value === 2 ? theme.palette.secondary.main : theme.palette.text.secondary, // Highlight when active
          }}
        />
        <BottomNavigationAction
          label="Marketplace"
          icon={<StorefrontIcon />}
          sx={{
            color: value === 3 ? theme.palette.secondary.main : theme.palette.text.secondary, // Highlight when active
          }}
        />
        <BottomNavigationAction
          label="My Sales" // Add My Sales here
          icon={<MonetizationOnIcon />} // Use the My Sales icon
          sx={{
            color: value === 4 ? theme.palette.secondary.main : theme.palette.text.secondary, // Highlight when active
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
