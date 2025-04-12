from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import psycopg2
import jwt
import os
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
SECRET_KEY = '5745982812f92acec913f8acd02d0740189ee03bea7af80e'

# Email Configuration
EMAIL_CONFIG = {
    'SENDER_EMAIL': "nishanthramanathan2003@gmail.com",
    'SENDER_PASSWORD': "mbutoyihvgorjhbd",  # Your app password
    'FROM_NAME': "Job Portal System"
}

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host='localhost',
        database='jobportal',
        user='postgres',
        password='1234'
    )
    return conn

# Email Functions
def send_email(recipient_email, subject, body):
    """Send email using SMTP_SSL"""
    message = MIMEMultipart()
    message['From'] = f"{EMAIL_CONFIG['FROM_NAME']} <{EMAIL_CONFIG['SENDER_EMAIL']}>"
    message['To'] = recipient_email
    message['Subject'] = subject
    message.attach(MIMEText(body, 'plain'))
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_CONFIG['SENDER_EMAIL'], EMAIL_CONFIG['SENDER_PASSWORD'])
            server.sendmail(
                EMAIL_CONFIG['SENDER_EMAIL'], 
                recipient_email, 
                message.as_string()
            )
        print(f"Email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {recipient_email}. Error: {e}")
        return False

def send_application_confirmation(applicant_email, applicant_name, job_title):
    """Send confirmation email to applicant"""
    subject = f"Application Received: {job_title}"
    body = f"""
    Dear {applicant_name},

    Thank you for applying for the {job_title} position through our Job Portal.
    We have received your application and will review it shortly.

    Best regards,
    The Hiring Team
    """
    return send_email(applicant_email, subject, body)

def send_application_notification(recruiter_email, applicant_name, job_title):
    """Send notification to recruiter"""
    subject = f"New Application for {job_title}"
    body = f"""
    Hello Recruiter,

    You have received a new application for: {job_title}

    Applicant: {applicant_name}

    Please review this application at your earliest convenience.

    Best regards,
    Job Portal System
    """
    return send_email(recruiter_email, subject, body)

def send_acceptance_email(applicant_email, applicant_name, job_title, ats_score):
    """Send acceptance email to applicant"""
    subject = f"Application Update: {job_title}"
    body = f"""
    Dear {applicant_name},

    We're pleased to inform you that your application for {job_title} 
    has been shortlisted.

    Our team will contact you shortly for next steps.

    Best regards,
    The Hiring Team
    """
    return send_email(applicant_email, subject, body)

def send_rejection_email(applicant_email, applicant_name, job_title, ats_score):
    """Send rejection email to applicant"""
    subject = f"Application Update: {job_title}"
    body = f"""
    Dear {applicant_name},

    Thank you for your interest in the {job_title} position.
    After careful consideration, we regret to inform you that your application 
     doesn't meet our current requirements.

    We encourage you to apply for future openings.

    Best regards,
    The Hiring Team
    """
    return send_email(applicant_email, subject, body)

# ATS Functions
def extract_keywords(description, skills):
    """Combine job description and skills for keyword extraction"""
    return f"{description} {skills}"

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF"""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

def calculate_ats_score(job_keywords, resume_text):
    """Calculate ATS compatibility score"""
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([job_keywords, resume_text])
    score = cosine_similarity(vectors[0], vectors[1])[0][0] * 100
    return round(score, 2)

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data['name']
    email = data['email']
    password = data['password']
    role = data['role']
    contact_number = data['contact_number']

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO users (name, email, password, role, contact_number) VALUES (%s, %s, %s, %s, %s)',
            (name, email, password, role, contact_number)
        )
        conn.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except psycopg2.IntegrityError:
        return jsonify({'message': 'Email already exists!'}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, name, role FROM users WHERE email = %s AND password = %s', (email, password))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        return jsonify({
            'message': 'Login successful!',
            'user': {
                'id': user[0],
                'name': user[1],
                'role': user[2]
            }
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/post-job', methods=['POST'])
def post_job():
    data = request.get_json()
    recruiter_id = data['recruiter_id']
    title = data['title']
    description = data['description']
    salary = data['salary']
    skills = data['skills']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO jobs (recruiter_id, title, description, salary, skills) VALUES (%s, %s, %s, %s, %s)',
        (recruiter_id, title, description, salary, skills)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Job posted successfully!'}), 201

@app.route('/recruiter-jobs/<int:recruiter_id>', methods=['GET'])
def get_recruiter_jobs(recruiter_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM jobs WHERE recruiter_id = %s', (recruiter_id,))
    jobs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(jobs), 200

@app.route('/jobs', methods=['GET'])
def get_all_jobs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM jobs')
    rows = cur.fetchall()
    cur.close()
    conn.close()

    jobs = []
    for row in rows:
        job = {
            "id": row[0],
            "recruiter_id": row[1],
            "title": row[2],
            "description": row[3],
            "salary": row[4],
            "skills": row[5],
            "posted_date": row[6]
        }
        jobs.append(job)

    return jsonify(jobs), 200

@app.route('/job-applicants/<int:job_id>', methods=['GET'])
def get_job_applicants(job_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT applications.id, users.name, users.email, applications.resume_path, 
               applications.ats_score, applications.status
        FROM applications
        JOIN users ON applications.applicant_id = users.id
        WHERE applications.job_id = %s
    ''', (job_id,))
    applicants = cur.fetchall()
    cur.close()
    conn.close()

    applicants_list = []
    for applicant in applicants:
        applicants_list.append({
            'id': applicant[0],
            'name': applicant[1],
            'email': applicant[2],
            'resume_path': applicant[3],
            'ats_score': applicant[4],
            'status': applicant[5]
        })

    return jsonify(applicants_list), 200

@app.route('/user', methods=['GET'])
def get_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 401

    try:
        if token.startswith('Bearer '):
            token = token[7:]
        else:
            return jsonify({'message': 'Invalid token format!'}), 401

        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = data['user_id']

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, email FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            return jsonify({
                'id': user[0],
                'name': user[1],
                'email': user[2]
            }), 200
        else:
            return jsonify({'message': 'User not found!'}), 404
    except ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}), 401
    except InvalidTokenError:
        return jsonify({'message': 'Invalid token!'}), 401
    except Exception as e:
        print('Error decoding token:', e)
        return jsonify({'message': 'An error occurred!'}), 500

@app.route('/apply', methods=['POST'])
def apply_for_job():
    print('Received application data:', request.form, request.files)

    applicant_name = request.form.get('name')
    job_id = request.form.get('job_id')
    resume = request.files.get('resume')

    if not (applicant_name and job_id and resume):
        return jsonify({'message': 'Missing required fields!'}), 400

    try:
        resume_data = resume.read()
        if not resume_data:
            return jsonify({'message': 'Resume file is empty!'}), 400

        resume.seek(0)

        uploads_dir = 'uploads'
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)

        filename = secure_filename(resume.filename)
        resume_path = os.path.join(uploads_dir, filename)
        resume.save(resume_path)

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT id, email FROM users WHERE name = %s', (applicant_name,))
        user = cur.fetchone()
        if not user:
            return jsonify({'message': 'User not found!'}), 401

        applicant_id, email = user

        cur.execute('''
            SELECT j.title, j.description, j.skills, u.email 
            FROM jobs j
            JOIN users u ON j.recruiter_id = u.id
            WHERE j.id = %s
        ''', (job_id,))
        job = cur.fetchone()
        if not job:
            return jsonify({'message': 'Job not found!'}), 404
        
        job_title, job_description, job_skills, recruiter_email = job
        job_keywords = extract_keywords(job_description, job_skills)
        resume_text = extract_text_from_pdf(resume_path)
        ats_score = calculate_ats_score(job_keywords, resume_text)

        cur.execute(
            '''
            INSERT INTO applications (job_id, applicant_id, name, email, resume_path, resume, ats_score, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            ''',
            (job_id, applicant_id, applicant_name, email, resume_path, psycopg2.Binary(resume_data), ats_score, 'pending')
        )
        application_id = cur.fetchone()[0]
        conn.commit()

        # Send initial emails
        confirmation_sent = send_application_confirmation(
            applicant_email=email,
            applicant_name=applicant_name,
            job_title=job_title
        )

        notification_sent = send_application_notification(
            recruiter_email=recruiter_email,
            applicant_name=applicant_name,
            job_title=job_title
        )

        # Determine acceptance/rejection based on ATS score
        if ats_score > 45:
            status_update = 'shortlisted'
            decision_email_sent = send_acceptance_email(
                applicant_email=email,
                applicant_name=applicant_name,
                job_title=job_title,
                ats_score=ats_score
            )
        else:
            status_update = 'rejected'
            decision_email_sent = send_rejection_email(
                applicant_email=email,
                applicant_name=applicant_name,
                job_title=job_title,
                ats_score=ats_score
            )

        # Update application status in database
        cur.execute(
            'UPDATE applications SET status = %s WHERE id = %s',
            (status_update, application_id)
        )
        conn.commit()

        return jsonify({
            'message': 'Application submitted successfully!',
            'confirmation_email_sent': confirmation_sent,
            'recruiter_notified': notification_sent,
            'decision_email_sent': decision_email_sent,
            'ats_score': ats_score,
            'application_status': status_update
        }), 201

    except Exception as e:
        print('Error processing application:', e)
        if 'conn' in locals():
            conn.rollback()
        return jsonify({'message': 'Failed to submit application!'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.route('/jobs/<int:job_id>', methods=['GET'])
def get_job_details(job_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM jobs WHERE id = %s', (job_id,))
    job = cur.fetchone()
    cur.close()
    conn.close()

    if job:
        job_details = {
            "id": job[0],
            "recruiter_id": job[1],
            "title": job[2],
            "description": job[3],
            "salary": job[4],
            "skills": job[5],
            "posted_date": job[6]
        }
        return jsonify(job_details), 200
    else:
        return jsonify({'message': 'Job not found!'}), 404

@app.route('/update-job-status/<int:job_id>', methods=['PUT'])
def update_job_status(job_id):
    data = request.get_json()
    status = data.get('status')
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('UPDATE jobs SET status = %s WHERE id = %s', (status, job_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': f'Job status updated to {status}!'}), 200

@app.route('/delete-job/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM jobs WHERE id = %s', (job_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Job deleted successfully!'}), 200
    
@app.route('/open-jobs', methods=['GET'])
def get_open_jobs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM jobs WHERE status = 'open'")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    jobs = []
    for row in rows:
        job = {
            "id": row[0],
            "recruiter_id": row[1],
            "title": row[2],
            "description": row[3],
            "salary": row[4],
            "skills": row[5],
            "posted_date": row[6]
        }
        jobs.append(job)

    return jsonify(jobs), 200

@app.route('/view-resume/<int:application_id>', methods=['GET'])
def view_resume(application_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            SELECT resume, name 
            FROM applications 
            WHERE id = %s
        ''', (application_id,))
        result = cur.fetchone()
        
        if not result or not result[0]:
            return jsonify({'error': 'Resume not found'}), 404
            
        resume_data, applicant_name = result
        filename = f"{applicant_name.replace(' ', '_')}_resume.pdf"
        
        headers = {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'inline; filename="{filename}"'
        }
        
        return Response(resume_data, headers=headers)
        
    except Exception as e:
        print(f'Error fetching resume: {str(e)}')
        return jsonify({'error': 'Server error'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/process-applications/<int:job_id>', methods=['POST'])
def process_applications(job_id):
    """Alternative endpoint to process applications in batch"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get all applications for this job
        cur.execute('''
            SELECT a.id, a.applicant_id, a.name, a.email, a.ats_score, 
                   u.name as applicant_name, j.title as job_title
            FROM applications a
            JOIN users u ON a.applicant_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE a.job_id = %s AND a.status = 'pending'
        ''', (job_id,))
        
        applications = cur.fetchall()
        results = []
        
        for app in applications:
            app_id, applicant_id, name, email, ats_score, applicant_name, job_title = app
            
            if ats_score > 45:
                email_sent = send_acceptance_email(email, applicant_name, job_title, ats_score)
                new_status = 'shortlisted'
            else:
                email_sent = send_rejection_email(email, applicant_name, job_title, ats_score)
                new_status = 'rejected'
            
            # Update status in database
            cur.execute(
                'UPDATE applications SET status = %s WHERE id = %s',
                (new_status, app_id)
            )
            
            results.append({
                'application_id': app_id,
                'applicant_name': applicant_name,
                'job_title': job_title,
                'ats_score': ats_score,
                'new_status': new_status,
                'email_sent': email_sent
            })
        
        conn.commit()
        return jsonify({
            'message': f'Processed {len(results)} applications',
            'results': results
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/test-email', methods=['GET'])
def test_email():
    """Test endpoint for email functionality"""
    test_recipient = "dhanyatha445@gmail.com"
    success = send_email(
        recipient_email=test_recipient,
        subject="Test Email from Job Portal",
        body="This is a test email from the Flask application."
    )
    return jsonify({
        'success': success,
        'message': f'Test email sent to {test_recipient}' if success else 'Failed to send test email'
    })

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)