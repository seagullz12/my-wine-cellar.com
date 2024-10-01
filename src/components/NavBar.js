import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 
import LoginIcon from '@mui/icons-material/Person'; 

const NavBar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const auth = getAuth();

  // Toggle menu visibility for mobile
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // Determine the title based on the current pathname
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/cellar':
        return 'My Wine Cellar';
      case '/add-wine':
        return 'Add New Wines';
      case '/personal-sommelier':
        return 'Personal Sommelier';
      case '/sign-in':
        return 'Sign In';
      case '/sign-up':
        return 'Sign Up';
      default:
        return 'Wine Cellar';
    }
  };

  const menuItems = [
    { title: 'Home', path: '/' },
    { title: 'Add New Wines', path: '/add-wine' },
    { title: 'My Wine Cellar', path: '/cellar' },
    { title: 'Personal Sommelier', path: '/personal-sommelier' },
    { title: 'Profile', path: '/profile' },
    { title: 'Sign In', path: '/sign-in', authRequired: false },
    { title: 'Sign Up', path: '/sign-up', authRequired: false },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {getTitle()}
        </Typography>
        <IconButton  edge="start" color="inherit" aria-label="menu" onClick={toggleMenu}>
          <MenuIcon />
        </IconButton>
        {user ? (
          <Button exact="true" color="inherit" onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <IconButton color="inherit" component={Link} to="/sign-in" aria-label="login">
            <LoginIcon />
          </IconButton>
        )}
      </Toolbar>
      <Drawer anchor="right" open={isMenuOpen} onClose={toggleMenu}>
        <div style={{ width: 250 }}>
          <IconButton onClick={toggleMenu} color="inherit" aria-label="close">
            <CloseIcon />
          </IconButton>
          <List>
            {menuItems.map((item) => {
              if (item.authRequired === undefined || (item.authRequired && user) || (!item.authRequired && !user)) {
                return (
                  <ListItem button={true} key={item.title} component={Link} to={item.path} onClick={() => setMenuOpen(false)}>
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
