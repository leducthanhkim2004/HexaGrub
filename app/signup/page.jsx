'use client';
import { signup } from "../login/actions";
import React, { useState } from "react";
import './style.css';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        const formData = new FormData(event.target); // Collect form data
        await signup(formData); // Call the signup function with the form data
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h1 className="signup-title">Create an Account</h1>
                <p className="signup-subtitle">Join us to enjoy exclusive features!</p>
                <form className="signup-form" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <label htmlFor="email" className="label">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        className="input-field"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    {/* Password Input */}
                    <label htmlFor="password" className="label">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="input-field"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    {/* Confirm Password Input */}
                    <label htmlFor="confirm-password" className="label">Confirm Password</label>
                    <input
                        type="password"
                        name="confirm-password"
                        placeholder="Confirm Password"
                        className="input-field"
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
}

