# Stage 1: Backend build
FROM python:3.9-slim as backend

# Sistem bağımlılıkları - tek RUN komutunda birleştirilmiş
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    wget \
    postgresql-client \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bağımlılıkları yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    playwright install && \
    playwright install-deps

# Uygulama kodunu kopyala
COPY . .

# Bekleme scriptini kopyala
COPY wait-for-postgres.sh .
RUN chmod +x wait-for-postgres.sh

# Uygulamayı başlat
CMD ["./wait-for-postgres.sh", "postgres", "5432", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]