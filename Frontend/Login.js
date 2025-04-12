import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password
            });

            // Check the user's role and redirect without showing a success message
            const user = response.data.user;
            if (user.role === 'recruiter') {
                // Redirect to Recruiter Dashboard
                navigate(`/recruiter-dashboard/${user.id}`);
            } else {
                // Redirect to Applicant Dashboard or another page
                navigate('/applicant-dashboard');
            }
        } catch (error) {
            if (error.response) {
                // Show error message for invalid credentials
                alert(error.response.data.message);
            } else if (error.request) {
                alert('No response from the server. Please check your network connection.');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p className="register-link">
                Don't have an account? <button onClick={() => navigate('/register')}>Register</button>
            </p>
        </div>
    );
};

export default Login;