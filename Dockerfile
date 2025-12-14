FROM node:22-alpine AS Builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma Client 
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

EXPOSE 8080

# Command to run the application
CMD ["node", "dist/src/main"]


