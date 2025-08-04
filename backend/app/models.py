from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    website = Column(String)
    address = Column(Text)
    status = Column(String, default="new")
    source = Column(String, nullable=True)  # ← yeni satır
