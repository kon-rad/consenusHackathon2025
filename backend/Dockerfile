# Dockerfile for Express.js backend

# Use official Node.js LTS image as the base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 5000

# Run the Express.js app
CMD ["npm", "start"]