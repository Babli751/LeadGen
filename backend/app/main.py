from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .services.google_maps import GoogleMapsService
from .services.scraper import ScraperService
from .models import Lead
from .database import SessionLocal
from .tasks import send_email_task
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    location: str
    max_results: int = 20

class EmailCampaignRequest(BaseModel):
    lead_ids: List[int]
    subject: str
    body: str
    sender_email: str

@app.post("/api/search")
async def search_leads(request: SearchRequest):
    db = SessionLocal()
    try:
        # Google Maps'ten işletmeleri al
        google_maps = GoogleMapsService(api_key=os.getenv("GOOGLE_API_KEY"))
        businesses = google_maps.search_businesses(request.query, request.location, request.max_results)
        
        # Web sitelerinden bilgi çek
        scraper = ScraperService()
        leads = []
        for business in businesses:
            if business.get('website'):
                contact_info = scraper.extract_contact_info(business['website'])
                lead_data = {
                    "name": business.get('name'),
                    "address": business.get('formatted_address'),
                    "phone": business.get('international_phone_number') or contact_info.get('phone'),
                    "email": contact_info.get('email'),
                    "website": business.get('website'),
                    "source": "google_maps"
                }
                lead = Lead(**lead_data)
                db.add(lead)
                leads.append(lead)
        
        db.commit()
        return {"leads": leads}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/send-emails")
async def send_emails(request: EmailCampaignRequest):
    db = SessionLocal()
    try:
        leads = db.query(Lead).filter(Lead.id.in_(request.lead_ids)).all()
        for lead in leads:
            if lead.email:
                send_email_task.delay(
                    sender_email=request.sender_email,
                    recipient_email=lead.email,
                    subject=request.subject,
                    body=request.body
                )
        return {"message": "E-posta gönderim işlemleri başlatıldı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()