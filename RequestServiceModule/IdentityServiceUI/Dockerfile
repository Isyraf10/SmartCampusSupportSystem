# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -G nodejs -u 1001

# Install serve globally
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy package files for runtime
COPY --chown=nodejs:nodejs package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["serve", "-s", "dist", "-l", "3000"]
