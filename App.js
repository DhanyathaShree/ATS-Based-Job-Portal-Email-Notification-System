

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import RecruiterDashboard from './components/RecruiterDashboard';
import ApplicantDashboard from './components/ApplicantDashboard';
import ApplyForm from './components/ApplyForm'; // Import the ApplyForm component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recruiter-dashboard/:recruiterId" element={<RecruiterDashboard />} />
                <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
                <Route path="/apply/:jobId" element={<ApplyForm />} /> {/* Add route for ApplyForm */}
            </Routes>
        </Router>
    );
}

export default App;
