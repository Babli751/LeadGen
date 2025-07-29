#!/bin/sh

# Backend ve frontend aynı anda çalıştır
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd /app/frontend && npm start &
wait