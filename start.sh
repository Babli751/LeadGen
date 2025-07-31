#!/bin/bash

# Veritabanının hazır olmasını bekleyelim
echo "PostgreSQL hazır olana kadar bekleniyor..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL hazır değil - bekleniyor..."
  sleep 1
done

echo "PostgreSQL hazır!"

# Uygulamayı başlat
echo "Uygulama başlatılıyor..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000