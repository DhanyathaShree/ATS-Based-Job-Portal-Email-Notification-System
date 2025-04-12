import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css'; // Import the CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons'; // Import icons

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <h1>Welcome to JobConnect</h1>
            <div className="buttons">
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    <FontAwesomeIcon icon={faSignInAlt} /> Login
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/register')}>
                    <FontAwesomeIcon icon={faUserPlus} /> Register
                </button>
            </div>
        </div>
    );
};

export default Welcome;