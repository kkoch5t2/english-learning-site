# Use the official Node.js image as a base
FROM node:20

# Set the working directory in the container
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY package*.json /app/frontend/

# Install dependencies
RUN npm install
RUN npm install react-router-dom

# Copy the rest of the application code
COPY . /app/frontend/

# Ensure all scripts in node_modules/.bin have execute permissions
RUN chmod -R +x /app/frontend/node_modules/.bin

# Build the React app
RUN npm run build

# Expose the port the React app runs on
EXPOSE 3000

# Command to run the React app
CMD ["npm", "start"]

