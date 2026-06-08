FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -G nodejs -u 1001

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5002/api/v1/health', (r) => { if (r.statusCode !== 200) throw new Error(r.statusCode) })"

CMD ["node", "server.js"]
