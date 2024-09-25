// src/components/PageTitle.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const metaDescriptions = {
  '/': 'Welcome to My Wine Cellar, your digital wine management solution. Discover, manage, and enjoy your wine collection effortlessly. Join our community of wine lovers today!',
  '/sign-in': 'Sign in to My Wine Cellar to access your personalized wine collection. Manage your wines, receive recommendations, and connect with fellow enthusiasts.',
  '/sign-up': 'Join My Wine Cellar today! Sign up to start managing your wine collection, get personalized recommendations, and share your passion for wine.',
  '/cellar': 'Browse your wine collection in My Wine Cellar. Easily view, organize, and manage your wines with our user-friendly interface.',
  '/personal-sommelier': 'Get personalized wine pairing recommendations based on the wines in your own Cellar at My Wine Cellar.',
  '/cellar/:id': 'View detailed information about your selected wine at My Wine Cellar. Explore tasting notes, reviews, and storage tips.',
  '/add-wine': 'Easily add new wines to your collection at My Wine Cellar. Keep track of your favorite wines and enhance your tasting experience.',
  '/shared/:token': 'Access shared wine details in My Wine Cellar. Collaborate with friends and family to explore and manage your wine collection.'
};

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Set the title and meta description based on the current path
    const title = getTitle(location.pathname);
    const description = metaDescriptions[location.pathname] || 'My Wine Cellar - Your Digital Wine Collection';
    
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute("content", description);
  }, [location]);

  const getTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'My Wine Cellar - Home';
      case '/sign-in':
        return 'My Wine Cellar - Sign In';
      case '/sign-up':
        return 'My Wine Cellar - Sign Up';
      case '/cellar':
        return 'My Wine Cellar - My Collection';
      case '/personal-sommelier':
        return 'My Wine Cellar - Personal AI Sommelier';
      case '/add-wine':
        return 'My Wine Cellar - Add Wine';
      // Add more cases as needed
      default:
        return 'My Wine Cellar';
    }
  };

  return null;
};

export default PageTitle;
