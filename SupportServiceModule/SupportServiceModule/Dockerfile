FROM node:18-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -G nodejs -u 1001

COPY package.json ./
RUN npm install --only=production && npm cache clean --force

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5003/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
