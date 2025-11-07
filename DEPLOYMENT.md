# Deployment Guide for DigitalOcean Droplets

This guide covers deploying the License Service backend API to DigitalOcean Droplets.

## Prerequisites

- DigitalOcean account
- Docker and Docker Compose installed on the droplet
- Domain name (optional, for custom domain setup)

## Quick Start

### 1. Connect to Your Droplet

```bash
ssh root@your-droplet-ip
```

### 2. Clone the Repository

```bash
cd /opt
git clone https://github.com/kridsadar357/license-services.git
cd license-services
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your production values
nano .env
```

**Required Environment Variables:**
```env
PORT=3000
DATABASE_URL=mysql://license_user:your_secure_password@mysql-db:3306/license_db

# For Docker Compose (in infrastructure/.env)
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=license_db
MYSQL_USER=license_user
MYSQL_PASSWORD=your_secure_password
```

### 4. Set Up Docker Infrastructure

```bash
cd infrastructure

# Copy environment file
cp .env.example .env
nano .env  # Edit with your production values

# Start services
docker-compose up -d
```

### 5. Initialize Database

```bash
# Wait for MySQL to be ready (check logs)
docker-compose logs mysql-db

# Push database schema
cd ..
bun run db:push
```

### 6. Verify Installation

```bash
# Check if API is running
curl http://localhost:3000/health

# Check API documentation
curl http://localhost:3000/swagger
```

## Production Configuration

### Using Nginx as Reverse Proxy (Recommended)

1. Install Nginx:
```bash
apt update
apt install nginx -y
```

2. Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/license-api
```

3. Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Enable site:
```bash
ln -s /etc/nginx/sites-available/license-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### SSL Certificate with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

## Security Checklist

- [ ] Change all default passwords in `.env` files
- [ ] Use strong, unique passwords
- [ ] Enable firewall (UFW):
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```
- [ ] Disable root SSH login (optional but recommended)
- [ ] Set up fail2ban for brute force protection
- [ ] Regularly update system packages
- [ ] Set up automated backups for MySQL data

## Monitoring

### View Logs

```bash
# API logs
cd infrastructure
docker-compose logs -f license-service

# Database logs
docker-compose logs -f mysql-db

# All logs
docker-compose logs -f
```

### Health Check

The API provides a health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "license-service"
}
```

## Backup & Restore

### Backup Database

```bash
docker exec mysql-license-db mysqldump -u license_user -p license_db > backup.sql
```

### Restore Database

```bash
docker exec -i mysql-license-db mysql -u license_user -p license_db < backup.sql
```

## Troubleshooting

### Service Not Starting

1. Check logs:
```bash
docker-compose logs license-service
```

2. Check if port is in use:
```bash
netstat -tulpn | grep 3000
```

3. Restart services:
```bash
docker-compose restart
```

### Database Connection Issues

1. Verify MySQL is running:
```bash
docker-compose ps mysql-db
```

2. Test connection:
```bash
docker exec -it mysql-license-db mysql -u license_user -p
```

3. Check DATABASE_URL in .env matches docker-compose.yml

## Environment Variables Reference

### Backend (.env)
- `PORT`: API server port (default: 3000)
- `DATABASE_URL`: MySQL connection string

### Docker Compose (infrastructure/.env)
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Database user
- `MYSQL_PASSWORD`: Database password
- `PORT`: API port (default: 3000)
- `DATABASE_URL`: Full database connection URL

## Support

For issues or questions, please refer to:
- README.md for general information
- SETUP.md for detailed setup instructions
- ADMIN_GUIDE.md for admin dashboard usage

