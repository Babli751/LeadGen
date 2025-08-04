from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.google_maps import GoogleMapsService
from .services.scraper import ScraperService
from .models import Lead, Base
from .database import SessionLocal, get_db, engine
from sqlalchemy.orm import Session
from .tasks import send_email_task
from pydantic import BaseModel
from typing import List
import os

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

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
async def search_leads(request: SearchRequest, db: Session = Depends(get_db)):
    try:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            raise HTTPException(status_code=500, detail="Google API key not configured")
            
        google_maps = GoogleMapsService(api_key=google_api_key)
        businesses = await google_maps.search_businesses(
            request.query, 
            request.location, 
            request.max_results
        )
        
        scraper = ScraperService()
        leads = []
        
        for business in businesses:
            if not business.get('website'):
                continue

            try:
                contact_info = await scraper.extract_contact_info(business['website'])
                
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

            except Exception as e:
                print(f"Error processing business {business.get('name')}: {str(e)}")
                continue
        
        db.commit()
        return {"leads": [{
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "website": lead.website,
            "address": lead.address,
            "status": lead.status
        } for lead in leads]}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/send-emails")
async def send_emails(request: EmailCampaignRequest, db: Session = Depends(get_db)):
    try:
        leads = db.query(Lead).filter(Lead.id.in_(request.lead_ids)).all()
        if not leads:
            raise HTTPException(status_code=404, detail="No leads found with given IDs")
            
        for lead in leads:
            if lead.email:
                send_email_task.delay(
                    sender_email=request.sender_email,
                    recipient_email=lead.email,
                    subject=request.subject,
                    body=request.body
                )
                
        return {"message": "E-posta gönderim işlemleri başlatıldı", "total_leads": len(leads)}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads")
async def get_leads(db: Session = Depends(get_db)):
    try:
        leads = db.query(Lead).all()
        return {"leads": [{
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "website": lead.website,
            "address": lead.address,
            "status": lead.status
        } for lead in leads]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))