const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db'); // Implied import for the database
const fs = require('fs');

const app = express();

// Configure CORS
app.use(cors());

// Add proper headers for file serving
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Log the exact path being served
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsPath);

// Serve files from the uploads directory
app.use('/uploads', express.static(uploadsPath));

// Update the static file serving to include the parent directory of uploads
app.use('/', express.static(path.join(__dirname)));

// Add a specific route to handle resume downloads
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(filePath);
});

// Add route to get resume path
app.get('/get-resume/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params;
        console.log('Fetching resume for application ID:', applicationId); // Debug log
        const query = 'SELECT resume_path FROM applications WHERE id = ?';
        const [result] = await db.query(query, [applicationId]);
        
        if (result && result.length > 0) {
            console.log('Found resume path:', result[0].resume_path); // Debug log
            res.json({ resume_path: result[0].resume_path });
        } else {
            res.status(404).json({ error: 'Resume not found' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update your job-applicants route
app.get('/job-applicants/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const query = `
            SELECT 
                applications.id as id,  /* Explicitly name the id column */
                applications.job_id,
                applications.applicant_id,
                applications.resume_path,
                applications.status,
                applications.name,
                applications.email
            FROM applications 
            WHERE applications.job_id = ?
        `;
        
        const [applicants] = await db.query(query, [jobId]);
        console.log('Sending applicants data:', applicants); // Debug log
        res.json(applicants);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/view-resume', (req, res) => {
    try {
        const resumePath = req.query.path;
        // Construct the full path
        const fullPath = path.join(__dirname, resumePath);
        
        // Security check to ensure the path is within the backend directory
        if (!fullPath.startsWith(path.join(__dirname, 'uploads'))) {
            return res.status(403).send('Access denied');
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('File not found');
        }

        // Set proper headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');

        // Stream the file
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error serving resume:', error);
        res.status(500).send('Error serving file');
    }
});

// Add a test route to check if the file exists
app.get('/check-file', (req, res) => {
    const filePath = req.query.path;
    const fullPath = path.join(__dirname, filePath);
    console.log('Checking file:', fullPath);
    
    if (fs.existsSync(fullPath)) {
        res.json({ exists: true, path: fullPath });
    } else {
        res.json({ exists: false, path: fullPath });
    }
});

app.get('/debug-file/:id', async (req, res) => {
    try {
        // Get the path from database
        const [result] = await db.query('SELECT resume_path FROM applications WHERE id = ?', [req.params.id]);
        const resumePath = result[0]?.resume_path;
        
        // Check if file exists
        const fullPath = path.join(__dirname, resumePath);
        const exists = fs.existsSync(fullPath);
        
        res.json({
            databasePath: resumePath,
            fullPath: fullPath,
            fileExists: exists,
            dirname: __dirname
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
