FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy the rest of your application
COPY . .

# Build your application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]