import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { auth, signInWithEmailAndPassword } from '../components/firebase-config';
import '../styles/SignIn.css'; // Import the CSS file for styling

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      //const user = userCredential.user;
      //const idToken = await user.getIdToken();

      // Redirect to Home page after successful sign-in
      navigate('/');
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error('Sign In Error:', error);
    }
  };

  return (
    <div className="signin-container">
      <h2 className="signin-title">Sign In</h2>
      <form className="signin-form" onSubmit={handleSignIn}>
        <label className="signin-label">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="signin-input"
          />
        </label>
        <label className="signin-label">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="signin-input"
          />
        </label>
        <button type="submit" className="signin-button">Sign In</button>
        {error && <p className="signin-error">{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;
