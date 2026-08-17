FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Stage 2: Final lightweight runtime environment
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies and package files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy the source code
COPY --from=builder /app/src ./src

# ADD THIS LINE TO COPY THE SERVICES FOLDER:
COPY --from=builder /app/services ./services

USER node
EXPOSE 5000
CMD ["node", "src/server.js"]