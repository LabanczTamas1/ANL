###############################################################################
# Stage 1 – install deps & build TypeScript
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

###############################################################################
# Stage 2 – production image (no dev-deps, no TS sources)
###############################################################################
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

# Migrations are plain JS — no compilation needed, copied directly
COPY migrations ./migrations

# Copy non-TS assets that the app may still need at runtime
COPY credentials.json usersList.json exported_data.json ./
COPY logs ./logs

EXPOSE 3001

CMD ["node", "dist/server.js"]
