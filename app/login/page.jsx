'use client';
import { login } from './actions';
import InputField from "../components/InputField";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'; // Import additional icons
import './style.css';
import React from 'react';
import Link from 'next/link';
import SignupPage from './Signup';
export default function LoginPage() {
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target); // Create a FormData object from the form
    await login(formData); // Call the login function with the form data
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Welcome Back!</h1>
      <p className="login-subtitle">Please log in to your account.</p>
      {/* Login Form */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Email Input with Envelope Icon */}
        <label htmlFor="email" className="label">Email</label>
        <InputField id="email" type="email" placeholder="Email address" icon={faEnvelope} />
        
        {/* Password Input with Lock Icon */}
        <label htmlFor="password" className="label">Password</label>
        <InputField id="password" type="password" placeholder="Password" icon={faLock} />
        
        
        <button type="submit" className="login-button">Log In</button>
      </form>
      
      <p className="signup-prompt">
        Don&apos;t have an account? <Link href="/signup" className="signup-link">Sign up</Link>
      </p>
    </div>
  );
}