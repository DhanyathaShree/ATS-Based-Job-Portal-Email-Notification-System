import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ApplicantDashboard.css';

const ApplicantDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [applicantName, setApplicantName] = useState('');
    const navigate = useNavigate();

    // Fetch applicant's name on component mount
    useEffect(() => {
        const fetchApplicantData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setApplicantName(response.data.name);
            } catch (error) {
                console.error('Error fetching applicant data:', error);
            }
        };
        fetchApplicantData();
    }, []);

    // Fetch all jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/jobs');
                setJobs(response.data);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };
        fetchJobs();
    }, []);

    // Handle "Apply" button click
    const handleApplyClick = (jobId) => {
        navigate(`/apply/${jobId}`);
    };

    return (
        <div className="dashboard-container">
            <h1>{applicantName ? `${applicantName}'s Dashboard` : 'Applicant Dashboard'}</h1>
            <div className="jobs-grid">
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div key={job.id} className="job-card">
                            <h3>{job.title}</h3>
                            <p><strong>Salary:</strong> {job.salary}</p>
                            <p><strong>Skills:</strong> {job.skills}</p>
                            <button onClick={() => handleApplyClick(job.id)}>Apply</button>
                        </div>
                    ))
                ) : (
                    <p>No jobs available.</p>
                )}
            </div>
        </div>
    );
};

export default ApplicantDashboard;