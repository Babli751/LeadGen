# Stage 1: Backend build
FROM python:3.9-slim as backend

WORKDIR /app/backend

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    playwright install chromium && \
    playwright install-deps

# Backend kodunu kopyala
COPY backend .

# Stage 2: Frontend build
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# Node bağımlılıkları
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

# Frontend kodunu kopyala
COPY frontend .

# Production build
RUN npm run build

# Stage 3: Runtime image
FROM python:3.9-slim

WORKDIR /app

# Backend kurulumu
COPY --from=backend /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin
COPY --from=backend /app/backend /app/backend
COPY --from=backend /root/.cache/ms-playwright /root/.cache/ms-playwright

# Frontend kurulumu
COPY --from=frontend /app/frontend/.next /app/frontend/.next
COPY --from=frontend /app/frontend/public /app/frontend/public
COPY --from=frontend /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend /app/frontend/package.json /app/frontend/package.json

# Başlatma scripti
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8000 3000

CMD ["./start.sh"]