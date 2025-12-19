# Use lightweight Node image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Build the project
RUN npm run build

# Start server
CMD ["npm", "start"]