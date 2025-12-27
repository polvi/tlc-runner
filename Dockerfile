# Use the official Bun image
FROM oven/bun:latest

# Install Java (OpenJDK) and curl
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk-headless \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download TLA+ tools (tla2tools.jar)
# We place it in the path expected by src/index.ts
RUN curl -L https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar -o /usr/local/lib/tla2tools.jar

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
