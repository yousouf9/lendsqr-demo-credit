FROM node:22.17.1-alpine

# Set working directory
WORKDIR /usr/app

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /usr/app/writable && \
    chown -R appuser:appgroup /usr/app

# Set writable directory as volume
VOLUME ["/usr/app/writable"]

USER appuser

# Install only production dependencies
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY --chown=appuser:appgroup . .

# Build app
RUN npm run build

# Start app
CMD ["npm", "run", "start:prod"]
