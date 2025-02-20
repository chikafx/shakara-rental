import React, { useEffect, useState } from "react";
import { auth, isSignInWithEmailLink, signInWithEmailLink } from "../firebase";

const VerifySignin = () => {
  const [message, setMessage] = useState("Verifying your sign-in...");
  const [error, setError] = useState(null);


  useEffect(() => {
    const signInWithEmail = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");

        if (!email) {
          email = window.prompt("Please enter the email address you used to request the sign-in link:");
          if (!email) {
            setError("Email is required to complete sign-in.");
            return;
          }
        }


        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          setMessage("Successfully signed in! Redirecting...");
          // Redirect after successful sign-in
          window.location.href = "/";
        } catch (error) {
          console.error("Error signing in:", error);
          let errorMessage = "Failed to complete sign-in. Please try again.";
          
          switch (error.code) {
            case 'auth/invalid-action-code':
              errorMessage = "The sign-in link is invalid or has expired. Please request a new one.";
              break;
            case 'auth/user-disabled':
              errorMessage = "This account has been disabled. Please contact support.";
              break;
            case 'auth/user-not-found':
              errorMessage = "No account found with this email address.";
              break;
            case 'auth/invalid-email':
              errorMessage = "Invalid email address provided.";
              break;
            default:
              errorMessage = "An unexpected error occurred. Please try again.";
          }

          
          setError(errorMessage);
          setMessage("");

        }
      }
    };

    signInWithEmail();
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Verify Sign-In</h2>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      {!message && !error && <p>Processing your sign-in request...</p>}
    </div>
  );
};


export default VerifySignin;
