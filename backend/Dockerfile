# Stage 1: Build Stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache --virtual .build-deps gcc g++ make python3

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Stage 2: Production Stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

# Expose the backend port
EXPOSE 5000

# Run the Express.js app
CMD ["npm", "start"]