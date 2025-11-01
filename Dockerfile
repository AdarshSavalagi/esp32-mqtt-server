# Use a lightweight Node.js Alpine image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the app port
EXPOSE 3000

# Run the Express app
CMD ["node", "server.js"]