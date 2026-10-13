FROM node:26-alpine

WORKDIR /app

# Install dependencies first to take advantage of layer caching
COPY /app/package*.json ./
RUN npm install --omit=dev

# Copy the app (index.html, server.js, images/)
COPY /app .

# Run as the non-root user that ships with the node image
USER node

EXPOSE 3000

CMD ["node", "server.js"]