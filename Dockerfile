# Stage 1: Build Vue Frontend
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS production-stage
WORKDIR /app

# Ensure required directories exist
RUN mkdir -p uploads storage

# Install production dependencies only (though the single package.json has both)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and built frontend
COPY --from=build-stage /app/dist ./dist
COPY server ./server

# Expose port (must match PORT in env or 3000 default)
EXPOSE 3000

# Set Node environment
ENV NODE_ENV=production

# Start Express server via the script
CMD ["node", "server/src/app.js"]
