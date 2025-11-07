#!/bin/bash

# Install Docker and Docker Compose on Ubuntu 22.04
# Run this script on your DigitalOcean droplet

set -e

echo "🐳 Installing Docker and Docker Compose..."

# Update system
echo "📦 Updating system packages..."
apt update
apt upgrade -y

# Install prerequisites
echo "📦 Installing prerequisites..."
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
echo "🔑 Adding Docker's GPG key..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo "📦 Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
echo "🐳 Installing Docker Engine..."
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
echo "🚀 Starting Docker service..."
systemctl start docker
systemctl enable docker

# Verify installation
echo "✅ Verifying installation..."
docker --version
docker compose version

# Add current user to docker group (optional, if not root)
if [ "$EUID" -ne 0 ]; then
    echo "👤 Adding user to docker group..."
    usermod -aG docker $USER
    echo "⚠️  You may need to log out and back in for group changes to take effect"
fi

echo "🎉 Docker and Docker Compose installed successfully!"
echo ""
echo "Next steps:"
echo "1. If you're not root, you may need to log out and back in"
echo "2. Use 'docker compose' (with space) instead of 'docker-compose'"
echo "3. Or create an alias: alias docker-compose='docker compose'"

