from celery import Celery
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import time
from .database import SessionLocal
from .models import Lead

celery = Celery(
    'tasks',
    broker=os.getenv("REDIS_URL", "redis://redis:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://redis:6379/0")
)

@celery.task(bind=True)
def send_email_task(self, sender_email: str, recipient_email: str, subject: str, body: str):
    try:
        # Anti-spam için bekleme
        time.sleep(5)
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(
            host=os.getenv("SMTP_HOST"),
            port=int(os.getenv("SMTP_PORT")),
            timeout=10
        ) as server:
            server.starttls()
            server.login(
                user=os.getenv("SMTP_USERNAME"),
                password=os.getenv("SMTP_PASSWORD")
            )
            server.send_message(msg)
        
        # Veritabanında durumu güncelle
        db = SessionLocal()
        try:
            lead = db.query(Lead).filter(Lead.email == recipient_email).first()
            if lead:
                lead.status = "email_sent"
                db.commit()
        finally:
            db.close()
            
        return {"status": "success", "email": recipient_email}
    except Exception as e:
        return {"status": "failed", "error": str(e)}