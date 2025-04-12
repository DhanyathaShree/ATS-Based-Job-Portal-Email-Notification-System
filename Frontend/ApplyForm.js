import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ApplyForm.css';

const ApplyForm = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [resume, setResume] = useState(null);
    const [job, setJob] = useState(null); // Store job details

    // Fetch job details on component mount
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/jobs/${jobId}`);
                setJob(response.data);
            } catch (error) {
                console.error('Error fetching job details:', error);
                alert('Failed to load job details.');
            }
        };
        fetchJobDetails();
    }, [jobId]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !resume) {
            alert('Please fill out all fields and upload a PDF resume.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('resume', resume);
        formData.append('job_id', jobId);

        try {
            const response = await axios.post('http://localhost:5000/apply', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
            navigate('/applicant-dashboard'); // Redirect back to the dashboard
        } catch (error) {
            console.error('Error submitting application:', error);
            alert(error.response?.data?.message || 'Failed to submit application. Please try again.');
        }
    };

    return (
        <div className="apply-form-container">
            <h1>Apply for Job</h1>

            {/* Display job details */}
            {job ? (
                <div className="job-details">
                    <h3>{job.title}</h3>
                    <p><strong>Salary:</strong> {job.salary}</p>
                    <p><strong>Skills:</strong> {job.skills}</p>
                    <p><strong>Description:</strong> {job.description}</p>
                </div>
            ) : (
                <p>Loading job details...</p>
            )}

            {/* Application form */}
            <form onSubmit={handleSubmit} className="apply-form">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResume(e.target.files[0])}
                    required
                />
                <button type="submit">Submit Application</button>
            </form>
        </div>
    );
};

export default ApplyForm;
