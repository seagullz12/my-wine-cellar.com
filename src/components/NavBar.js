import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 
import LoginIcon from '@mui/icons-material/Person'; 
import HomeIcon from '@mui/icons-material/Home'; // Import HomeIcon

const NavBar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const auth = getAuth();

  // Hook to manage authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // Function to toggle menu visibility for mobile
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Function to handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  // Determine the title based on the current pathname
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/cellar':
        return 'My Wine Cellar';
      case '/add-wine':
        return 'Add New Wines';
      case '/marketplace':
        return 'Marketplace';
      case '/personal-sommelier':
        return 'Personal Sommelier';
      case '/sign-in':
        return 'Sign In';
      case '/sign-up':
        return 'Sign Up';
        case '/listings':
          return 'Manage Listings';
        case '/seller/dashboard':
          return 'Sales Dashboard';
      default:
        return 'Wine Cellar';
    }
  };

  // Menu items configuration
  const menuItems = [
    { title: 'Home', path: '/' },
    { title: 'Add New Wines', path: '/add-wine' },
    { title: 'My Wine Cellar', path: '/cellar' },
    { title: 'Marketplace', path: '/marketplace' },
    { title: 'Personal Sommelier', path: '/personal-sommelier' },
    { title: 'Sign In', path: '/sign-in', authRequired: false },
    { title: 'Sign Up', path: '/sign-up', authRequired: false },
    ...(user ? [{ title: 'Profile', path: '/profile' }] : []), 
    ...(user ? [{ title: 'My Sales', path: '/seller/dashboard' }] : []), 
    ...(user ? [{ title: 'Manage Listings', path: '/my-listings' }] : []), 
  ];

  // Render the component
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Home Button */}
        <IconButton color="inherit" component={Link} to="/" aria-label="home">
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {getTitle()}
        </Typography>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleMenu}>
          <MenuIcon />
        </IconButton>
        {user ? (
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/sign-in"
            aria-label="login"
            sx={{
              bgcolor: 'primary.main', // Highlight background color
              '&:hover': {
                bgcolor: 'primary.dark', // Darker on hover
              },
              transition: 'background-color 0.3s ease', // Smooth transition
            }}
          >
            <LoginIcon sx={{ mr: 1 }} /> Sign In
          </Button>
        )}
      </Toolbar>
      <Drawer anchor="right" open={isMenuOpen} onClose={toggleMenu}>
        <div style={{ width: 250 }}>
          <IconButton onClick={toggleMenu} color="inherit" aria-label="close">
            <CloseIcon />
          </IconButton>
          <List>
            {menuItems.map((item) => {
              // Render menu items based on authentication status
              if (item.authRequired === undefined || (item.authRequired && user) || (!item.authRequired && !user)) {
                return (
                  <ListItem button key={item.title} component={NavLink} to={item.path} 
                            onClick={() => setMenuOpen(false)} 
                            activeClassName="active-link" 
                            style={({ isActive }) => ({ backgroundColor: isActive ? '#f0e1e0' : 'transparent' })} // Active styling
                  >
                    <ListItemText primary={item.title} />
                  </ListItem>
                );
              }
              return null;
            })}
          </List>
        </div>
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
