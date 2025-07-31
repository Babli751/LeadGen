FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Backend'in hazır olmasını bekle
COPY wait-for-backend.sh .
RUN chmod +x wait-for-backend.sh

CMD ["./wait-for-backend.sh", "backend", "8000", "npm", "run", "dev"]