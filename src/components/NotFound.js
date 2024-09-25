// src/components/NotFound.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import './NotFound.css'; // Optional: if you have specific styles

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10);

    // Cleanup timer if the component is unmounted before the timer finishes
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page Not Found</p>
      <p>Redirecting to home page in 5 seconds...</p>
    </div>
  );
};

export default NotFound;
