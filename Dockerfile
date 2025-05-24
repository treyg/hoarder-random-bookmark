FROM docker.io/oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY . .

# Build TypeScript code
RUN bun build ./src/index.ts --outdir ./dist --target=bun

# Start the application
CMD ["bun", "src/index.ts"]

# Expose the port
EXPOSE 8080