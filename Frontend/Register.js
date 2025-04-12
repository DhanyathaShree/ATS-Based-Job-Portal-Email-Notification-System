import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the CSS file

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('applicant');
    const [contactNumber, setContactNumber] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/register', {
                name,
                email,
                password,
                role,
                contact_number: contactNumber
            });
            alert(response.data.message);
            navigate('/login');
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            } else if (error.request) {
                alert('No response from the server. Please check your network connection.');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="tel"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="applicant">Applicant</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button type="submit">Register</button>
            </form>
            <p className="login-link">
                Already have an account? <button onClick={() => navigate('/login')}>Login</button>
            </p>
        </div>
    );
};

export default Register;