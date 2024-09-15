# Use official Node.js image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install the app dependencies inside the container
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port the app will run on (Cloud Run uses port 8080 by default)
EXPOSE 8080

# Start the Node.js server using the command
CMD [ "node", "server.js" ]
