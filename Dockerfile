FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run the application directly from TypeScript (Bun can run TS natively)
CMD ["bun", "run", "src/index.ts"]

