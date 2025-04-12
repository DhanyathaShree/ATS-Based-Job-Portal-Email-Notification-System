import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender_email, sender_password, recipient_email, subject, body):
    """
    Send an email from sender_email to recipient_email
    
    Parameters:
        sender_email (str): Email address of the sender
        sender_password (str): Password or app password for the sender's email
        recipient_email (str): Email address of the recipient
        subject (str): Subject of the email
        body (str): Body content of the email
    """
    
    # Create message container
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = subject
    
    # Attach the body to the email
    message.attach(MIMEText(body, 'plain'))
    
    try:
        # For Gmail (using SMTP_SSL)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, message.as_string())
        
        print("Email sent successfully!")
        
    except Exception as e:
        print(f"Failed to send email. Error: {e}")

# Example usage
if __name__ == "__main__":
    # Replace these with your actual email credentials and details
    YOUR_EMAIL = "nishanthramanathan2003@gmail.com"
    YOUR_PASSWORD = "mbutoyihvgorjhbd"
    RECIPIENT_EMAIL = "dhanyatha445@gmail.com"
    EMAIL_SUBJECT = "Test Email from Python"
    EMAIL_BODY = "Hello,\n\nThis is a test email sent from Python."
    
    send_email(YOUR_EMAIL, YOUR_PASSWORD, RECIPIENT_EMAIL, EMAIL_SUBJECT, EMAIL_BODY)