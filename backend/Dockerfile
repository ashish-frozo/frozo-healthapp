# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/firebase-service-account.json ./firebase-service-account.json

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# EXPOSE 8080 (Railway handles port mapping)
ENV NODE_ENV=production

CMD ["./start.sh"]
