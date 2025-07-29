from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

# PostgreSQL bağlantı URL'si
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgres:5432/dbname")

# SQLAlchemy engine oluşturma
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal sınıfı
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy Base sınıfı
Base = declarative_base()