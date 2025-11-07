FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy only necessary source files (excludes client-products, NativeLicenseService)
COPY src ./src
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY scripts ./scripts

# Expose port
EXPOSE 3000

# Run the application directly from TypeScript (Bun can run TS natively)
CMD ["bun", "run", "src/index.ts"]

