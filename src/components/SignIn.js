import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { auth, signInWithEmailAndPassword } from './firebase-config';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      // Handle the ID token (e.g., send it to your backend)
      console.log('ID Token:', idToken);

      // Redirect to Home page after successful sign-in
      navigate('/wine-scanner');
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error('Sign In Error:', error);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Sign In</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;
