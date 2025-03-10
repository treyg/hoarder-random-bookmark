FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY . .

# Build TypeScript code
RUN bun build ./src/index.ts --outdir ./dist

# Start the application
CMD ["bun", "run", "dist/index.js"]

# Expose the port
EXPOSE 8080