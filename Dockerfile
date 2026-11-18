# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/jest.config.js ./

# Build
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/server.js"]
