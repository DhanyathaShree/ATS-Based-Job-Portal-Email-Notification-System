# ATS-Based-Job-Portal-Email-Notification-System
Certainly! Here's your refined and **professionally formatted** `README.md` content written in a clean, formal tone, ideal for a GitHub repository:

---

# ATS-Based Job Portal Email Notification System

This project is a comprehensive job portal solution designed for both applicants and recruiters. It features an integrated Applicant Tracking System (ATS) to evaluate resumes based on job descriptions using NLP techniques, and an automated email notification system to communicate application status. The system streamlines the recruitment workflow by enhancing the efficiency and transparency of the job application process.

---

## Overview

The platform provides two primary interfaces:

- **Applicants** can register, manage their profile, view job listings, upload resumes, and receive real-time feedback based on their resume's relevance to job descriptions.
- **Recruiters** can post jobs, view applicants, and utilize ATS scores to automate or manually manage candidate selection.

A key feature of this system is its ability to automatically evaluate and score resumes, determine application outcomes, and notify candidates accordingly.

---

## Features Implemented

### 1. Applicant Module

- **User Authentication**: Secure signup and login using email and password with JWT-based authentication.
- **Profile Management**: Ability to upload and manage resumes.
- **Job Browsing**: View all job postings with filters by role or skill.
- **Job Application**: Apply to jobs with a resume upload feature.
- **ATS Scoring**:
  - Resumes are analyzed using NLP (TF-IDF).
  - Score is computed based on the textual similarity between resume content and job description.
- **Application Decision Automation**:
  - If ATS Score ≥ 60%, the application is automatically marked as accepted, and a confirmation email is sent.
  - If ATS Score < 60%, the application status remains pending for manual review by the recruiter.
- **Email Notifications**:
  - **Accepted**: "We are proceeding with you."
  - **Rejected**: "We will not be moving forward."

### 2. Recruiter Module

- **User Authentication**: Recruiter signup and login.
- **Job Management**: Ability to post, view, and delete job listings.
- **Application Review**:
  - View a list of applicants for each job posting.
  - Access ATS scores for all applicants.
- **Manual Review Option**:
  - Accept or reject candidates with ATS Score < 60%.
  - Trigger appropriate status updates and email notifications.

---

## ATS (Applicant Tracking System) Logic

- **Text Analysis**: Uses Term Frequency–Inverse Document Frequency (TF-IDF) for evaluating textual similarity.
- **Relevance Scoring**: Generates a numerical score (0–100) to quantify the match between a resume and the job description.
- **Format Support**: Supports resume files in DOCX, PDF, and plain text formats.

---

## Email Notification System

- Implemented using Python with SMTP (Gmail).
- Emails are sent under the following conditions:
  - When an application is auto-accepted (ATS Score ≥ 60%).
  - When a recruiter manually accepts or rejects an application.
- Emails are composed in plain text but can be extended to HTML formatting if required.

---

## Technology Stack

| Component          | Technology            |
|--------------------|------------------------|
| Frontend           | React.js               |
| Backend            | Python (Flask)         |
| Database           | PostgreSQL             |
| Authentication     | JWT (JSON Web Tokens)  |
| Email Delivery     | Python SMTP (Gmail)    |
| ATS & NLP Engine   | TF-IDF (Scikit-learn)  |
| Resume Parsing     | PDF support (basic parsing) |
