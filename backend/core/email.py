# backend/core/email.py
import emails
from config import settings
import random
import string

def generate_activation_code(length: int = 6) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def send_activation_email(email_to: str, activation_code: str):
    message = emails.Message(
        subject='Account Activation',
        html=f'<p>Your activation code is: <strong>{activation_code}</strong></p>',
        mail_from=settings.SMTP_USER
    )
    
    response = message.send(
        to=email_to,
        smtp={
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "timeout": 5,
            "user": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "tls": True,
        }
    )
    
    return response.status_code == 250

def generate_reset_code(length: int = 6) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def send_password_reset_email(email_to: str, reset_code: str):
    message = emails.Message(
        subject='Password Reset',
        html=f'<p>Your password reset code is: <strong>{reset_code}</strong></p>',
        mail_from=settings.SMTP_USER
    )
    
    response = message.send(
        to=email_to,
        smtp={
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "timeout": 5,
            "user": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "tls": True,
        }
    )
    
    return response.status_code == 250