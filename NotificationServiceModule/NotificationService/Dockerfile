FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -G nodejs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 5004

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5004/api/v1/health || exit 1

CMD ["npm", "start"]
