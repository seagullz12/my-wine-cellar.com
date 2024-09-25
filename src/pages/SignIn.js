import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../components/firebase-config';
import '../styles/SignIn.css'; // Import the CSS file for styling

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  // Handle sign-in logic
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to Home page after successful sign-in
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error('Sign In Error:', error);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Reset email sent successfully to, ',email);
      setResetMessage('Password reset email sent! Please check your inbox.');
      setError('');
    } catch (error) {
      console.error('Error sending reset email:', error); // Controleer voor foutmeldingen
      setError('Failed to send reset email. Please make sure the email is correct.');
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
        {resetMessage && <p className="signin-message">{resetMessage}</p>}
      </form>

      {/* Reset Password Link */}
      <p className="signin-reset-password">
        Forgot your password?{' '}
        <button type="button" onClick={handlePasswordReset} className="reset-password-button">
          Reset Password
        </button>
      </p>
    </div>
  );
};

export default SignIn
