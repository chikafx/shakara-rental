import React, { useState, useEffect } from 'react';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { isValidEmail } from '../utils/validation';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Eye, EyeOff } from 'react-feather';
import '../styles/auth.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberMeEmail');
    const savedPassword = localStorage.getItem('rememberMePassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);



  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', email);
        localStorage.setItem('rememberMePassword', password);
      } else {
        localStorage.removeItem('rememberMeEmail');
        localStorage.removeItem('rememberMePassword');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in: ", userCredential.user);
      // Redirect to home page after successful login
      window.location.href = "/";

    } catch (error) {
      console.error("Error logging in: ", error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect to home page after successful Google login
      window.location.href = "/";

    } catch (error) {
      setError(error.message || 'Google login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Login to Your Account</h2>
        <p>Welcome back! Please sign in to continue.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="remember-me">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="social-login">
        <div className="auth-divider">OR</div>
        <button className="social-button google-button" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" width="18" />
          Continue with Google
        </button>
      </div>

      <div className="auth-footer">
        <p>
          Don't have an account? <a href="/signup">Create account</a>
        </p>
        <p>
          <a href="/forgot-password">Forgot your password?</a>
        </p>
      </div>
    </div>

  );
};

export default Login;
