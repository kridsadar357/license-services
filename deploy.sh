#!/bin/bash

# Deployment script for DigitalOcean Droplets
# This script sets up the License Service backend on a fresh droplet

set -e

echo "🚀 Starting License Service Deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update
apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
fi

# Install Bun (for database migrations)
echo "⚡ Installing Bun..."
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Clone repository if not already present
if [ ! -d "/opt/license-services" ]; then
    echo "📥 Cloning repository..."
    cd /opt
    git clone https://github.com/kridsadar357/license-services.git
    cd license-services
else
    echo "📂 Repository already exists, updating..."
    cd /opt/license-services
    git pull
fi

# Set up environment files
echo "🔧 Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your production values!"
    echo "   Run: nano .env"
fi

if [ ! -f "infrastructure/.env" ]; then
    cp infrastructure/.env.example infrastructure/.env
    echo "⚠️  Please edit infrastructure/.env file with your production values!"
    echo "   Run: nano infrastructure/.env"
fi

# Start Docker services
echo "🚀 Starting Docker services..."
cd infrastructure
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check MySQL health
for i in {1..30}; do
    if docker-compose exec -T mysql-db mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL is ready!"
        break
    fi
    echo "Waiting for MySQL... ($i/30)"
    sleep 2
done

# Run database migrations
echo "📊 Running database migrations..."
cd ..
export PATH="$HOME/.bun/bin:$PATH"
bun install
bun run db:push

# Verify installation
echo "🔍 Verifying installation..."
sleep 5
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API is running successfully!"
    echo "📍 API URL: http://localhost:3000"
    echo "📚 Swagger Docs: http://localhost:3000/swagger"
else
    echo "⚠️  API health check failed. Check logs with:"
    echo "   cd infrastructure && docker-compose logs license-service"
fi

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env files with your production values"
echo "2. Set up Nginx reverse proxy (see DEPLOYMENT.md)"
echo "3. Configure SSL certificate"
echo "4. Set up firewall rules"

