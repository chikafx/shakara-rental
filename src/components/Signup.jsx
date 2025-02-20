import React, { useState } from "react";
import { auth, sendSignInLinkToEmail, signInWithGoogle } from "../firebase";
import { isValidEmail } from "../utils/validation";
import { Eye, EyeOff } from 'react-feather';
import '../styles/auth.css';



const Signup = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const handleSignup = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!process.env.REACT_APP_PRODUCTION_URL) {
      setError("Server configuration error. Please try again later.");
      return;
    }

    const actionCodeSettings = {
      url: process.env.REACT_APP_PRODUCTION_URL + "/verify-signin",
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.shakararentals.ios'
      },
      android: {
        packageName: 'com.shakararentals.android',
        installApp: true,
        minimumVersion: '12'
      },
      dynamicLinkDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
    };

    console.log("Sending sign-in link to:", email);
    console.log("Action code settings:", actionCodeSettings);



    try {
      setLoading(true);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("Check your email for the sign-in link!");
      window.location.href = "/";

    } catch (error) {
      console.error("Error sending email link:", error);
      let errorMessage = "Failed to send sign-in link. Please try again.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/missing-android-pkg-name':
        case 'auth/missing-ios-bundle-id':
          errorMessage = "Mobile app configuration missing. Please contact support.";
          break;
        case 'auth/unauthorized-domain':
          errorMessage = "Domain not authorized. Please contact support.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email link sign-in is not enabled. Please contact support.";
          break;
        default:
          errorMessage = "An unexpected error occurred. Please try again.";
      }

      
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage("");
      await signInWithGoogle();
      setMessage("Google sign-in successful!");
      window.location.href = "/";

    } catch (error) {
      setError(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Get started with your Shakara Rentals account</p>
      </div>


      {loading && <p>Signing in...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleSignup}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
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
            'Sign Up'
          )}
        </button>
      </form>

      <div className="social-login">
        <button className="social-button google-button" onClick={handleGoogleSignup}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" width="18" />
          Continue with Google
        </button>
      </div>

      <div className="auth-footer">
        <p>Already have an account? <a href="/login">Sign in here</a></p>
      </div>
    </div>

  );
};

export default Signup;
