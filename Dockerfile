FROM node:20-alpine AS builder
WORKDIR /app
# Install client dependencies and build
COPY Client/package*.json ./Client/
RUN cd Client && npm ci --no-audit
COPY Client/ ./Client/
RUN cd Client && npm run build
# Production stage
FROM node:20-alpine
WORKDIR /app
# Install server dependencies
COPY Server/package*.json ./Server/
RUN cd Server && npm ci --no-audit --omit=dev
COPY Server/ ./Server/
COPY --from=builder /app/Client/dist ./Client/dist
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
# Seed on first run, then start server
CMD ["sh", "-c", "cd Server && node seed.js && node index.js"]