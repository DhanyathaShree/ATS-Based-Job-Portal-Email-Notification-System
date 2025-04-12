import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
    const { recruiterId } = useParams();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        salary: '',
        skills: ''
    });
    const [showJobForm, setShowJobForm] = useState(false);

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

    const fetchApplicants = async (jobId) => {
        try {
            const response = await axios.get(`http://localhost:5000/job-applicants/${jobId}`);
            console.log('Applicants data:', response.data);
            
            // Ensure we're using the correct ID field
            const verifiedApplicants = response.data.map(applicant => ({
                ...applicant,
                application_id: applicant.id // This should match the PK from applications table
            }));
            
            setApplicants(verifiedApplicants);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        }
    };

    const handleViewResume = async (applicationId, e) => {
        e.stopPropagation();
        
        if (!applicationId) {
            console.error('Missing application ID for resume');
            alert('Cannot view resume - missing application reference');
            return;
        }
    
        try {
            // Open in new tab
            const url = `http://localhost:5000/view-resume/${applicationId}`;
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            // Fallback if popup is blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Download the resume
                const response = await axios.get(url, {
                    responseType: 'blob'
                });
                
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `resume_${applicationId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                // Clean up
                window.URL.revokeObjectURL(downloadUrl);
            }
        } catch (error) {
            console.error('Error viewing resume:', error);
            alert('Failed to open resume. Please try again.');
        }
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        fetchApplicants(job.id);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prev => ({ ...prev, [name]: value }));
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/post-job', {
                recruiter_id: recruiterId,
                ...newJob,
                status: 'open'
            });
            alert('Job posted successfully!');
            setNewJob({ title: '', description: '', salary: '', skills: '' });
            setShowJobForm(false);
            const response = await axios.get('http://localhost:5000/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job. Please try again.');
        }
    };

    const handleCloseJob = async (jobId) => {
        try {
            await axios.put(`http://localhost:5000/update-job-status/${jobId}`, { status: 'closed' });
            const updatedJobs = jobs.map(job => 
                job.id === jobId ? {...job, status: 'closed'} : job
            );
            setJobs(updatedJobs);
        } catch (error) {
            console.error('Error closing job:', error);
        }
    };

    const handleDeleteJob = async (jobId) => {
        try {
            if (window.confirm('Are you sure you want to permanently delete this job?')) {
                await axios.delete(`http://localhost:5000/delete-job/${jobId}`);
                setJobs(jobs.filter(job => job.id !== jobId));
                if (selectedJob && selectedJob.id === jobId) {
                    setSelectedJob(null);
                    setApplicants([]);
                }
            }
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    return (
        <div className="recruiter-dashboard">
            <h1>Recruiter Dashboard</h1>

            {/* Post New Job Section */}
            <div className="job-form-container">
                <button 
                    onClick={() => setShowJobForm(!showJobForm)}
                    className={`toggle-form-btn ${showJobForm ? 'cancel' : 'post'}`}
                >
                    {showJobForm ? 'Cancel Posting' : 'Post New Job'}
                </button>

                {showJobForm && (
                    <div className="job-form">
                        <h2>Post New Job</h2>
                        <form onSubmit={handlePostJob}>
                            <div className="form-group">
                                <label>Job Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newJob.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    name="description"
                                    value={newJob.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Salary:</label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={newJob.salary}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Required Skills (comma separated):</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={newJob.skills}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <button type="submit" className="submit-job-btn">
                                Post Job
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Jobs List Section */}
            <div className="jobs-section">
                <h2>
                    {jobs.some(job => job.recruiter_id === parseInt(recruiterId)) ? 'Your Job Postings' : 'All Jobs'}
                </h2>
                
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => handleJobClick(job)}
                            className={`job-card ${job.recruiter_id === parseInt(recruiterId) ? 'own-job' : ''} ${job.status === 'closed' ? 'closed' : ''}`}
                        >
                            <div className="job-header">
                                <h3>
                                    {job.title}
                                    {job.status === 'closed' && <span className="closed-badge">(Closed)</span>}
                                </h3>
                                <span className="post-date">
                                    Posted on: {new Date(job.posted_date).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <p className="job-description">{job.description}</p>
                            
                            <div className="job-details">
                                <p><strong>Salary:</strong> {job.salary}</p>
                                <p><strong>Skills:</strong> {job.skills}</p>
                            </div>

                            {job.recruiter_id === parseInt(recruiterId) && (
                                <div className="job-actions">
                                    {job.status === 'open' && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloseJob(job.id);
                                            }}
                                            className="close-job-btn"
                                        >
                                            Close Job
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteJob(job.id);
                                        }}
                                        className="delete-job-btn"
                                    >
                                        Delete Job
                                    </button>
                                </div>
                            )}

                            {selectedJob && selectedJob.id === job.id && job.recruiter_id === parseInt(recruiterId) && (
                                <div className="applicants-section">
                                    <h4>Applicants:</h4>
                                    
                                    {applicants.length > 0 ? (
                                        <div className="applicants-grid">
                                            {applicants.map((applicant, index) => (
                                                <div key={index} className="applicant-card">
                                                    <p><strong>Name:</strong> {applicant.name}</p>
                                                    <p><strong>Email:</strong> {applicant.email}</p>
                                                    <p><strong>Status:</strong> {applicant.status || 'pending'}</p>
                                                    {applicant.resume_path && (
                                                        <p><strong>Resume:</strong> {applicant.resume_path.split('/').pop()}</p>
                                                    )}
                                                    <div className="applicant-actions">
                                                        <button 
                                                            onClick={(e) => handleViewResume(applicant.application_id, e)}
                                                            className="view-resume-btn"
                                                        >
                                                            View Resume
                                                        </button>
                                                        
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-applicants">No applicants yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-jobs">No jobs available.</p>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;