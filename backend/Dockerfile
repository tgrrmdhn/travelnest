# Backend Dockerfile
FROM node:20-alpine AS backend

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/kyc uploads/profiles uploads/properties

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npm run migrate && npm start"]
