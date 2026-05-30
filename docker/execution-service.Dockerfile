FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY execution-service/package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY --from=deps /app/node_modules ./node_modules
COPY execution-service .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache docker-cli
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY execution-service/package.json ./package.json
EXPOSE 5001
CMD ["node", "dist/server.js"]
