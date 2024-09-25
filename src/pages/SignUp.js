import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUp.css'; // Import the CSS file for styling

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // For redirecting after sign-up

  const auth = getAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to the main page after successful sign-up
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error('Sign Up Error:', error);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up Now!</h2>
      <form className="signup-form" onSubmit={handleSignUp}>
        <label className="signup-label">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="signup-input"
          />
        </label>
        <label className="signup-label">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="signup-input"
          />
        </label>
        <button type="submit" className="signup-button">Sign Up</button>
        {error && <p className="signup-error">{error}</p>}
      </form>
    </div>
  );
};

export default SignUp;
