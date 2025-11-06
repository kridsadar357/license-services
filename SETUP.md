# Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- Bun runtime (for local development)

## Quick Start with Docker Compose

### 1. Start Infrastructure Services

From the `infrastructure` directory:

```bash
cd infrastructure
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- phpMyAdmin on port 8080
- License Service API on port 3000

### 2. Database Configuration

The docker-compose.yml is configured with:
- **Database**: `license_db`
- **User**: `license_user`
- **Password**: `license_pass_123`
- **Root Password**: `root_password_change_me` (⚠️ Change this in production!)
- **Host Port**: `3307` (mapped from container port 3306 to avoid conflicts with local MySQL)

### 3. Environment Variables

For **local development** (running outside Docker), create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://license_user:license_pass_123@localhost:3307/license_db"
PORT=3000
```

**Note**: Port 3307 is used because port 3306 is already in use on your system. The Docker container uses 3306 internally, but it's mapped to 3307 on the host.

For **Docker Compose** (running inside Docker), the environment is automatically configured in `docker-compose.yml`.

### 4. Initialize Database Schema

After the database is running, initialize the schema:

```bash
# If running locally (make sure database is running first)
bun run db:push

# Or if using Docker Compose, exec into the container
docker exec -it license-api bun run db:push

# Or run the migration command directly in the container
docker-compose exec license-service bun run db:push
```

### 5. Access Services

- **License API**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/swagger
- **Admin Dashboard**: http://localhost:5173 (see Frontend Setup below)
- **phpMyAdmin**: http://localhost:8080
  - Server: `mysql-db`
  - Username: `license_user`
  - Password: `license_pass_123`

### 6. Frontend Setup (Admin Dashboard)

1. Install dependencies:
   ```bash
   cd client-products
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access the admin dashboard at http://localhost:5173

The frontend includes:
- **Products Management** - Create, edit, delete, enable/disable products
- **License Management** - Full CRUD operations for licenses
- **Support Center** - Search licenses by various criteria

## Local Development (Without Docker)

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Database

Make sure MySQL is running via docker-compose:

```bash
cd infrastructure
docker-compose up -d mysql-db phpmyadmin
```

### 3. Configure Environment

Create `.env` file:

```env
DATABASE_URL="mysql://license_user:license_pass_123@localhost:3307/license_db"
PORT=3000
```

### 4. Initialize Database

```bash
bun run db:push
```

### 5. Run Development Server

```bash
bun run dev
```

## Production Deployment

1. **Update passwords** in `infrastructure/docker-compose.yml`
2. **Set strong passwords** for:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
3. **Use HTTPS** with a reverse proxy (Nginx/Traefik)
4. **Update DATABASE_URL** in docker-compose.yml for production database

## Generate License Keys

To create license keys in the database, use the license generation script:

```bash
# Generate a single license key (auto-generated)
bun run license:generate "my-product"

# Generate multiple license keys
bun run license:generate "my-product" 5

# Generate a custom license key
bun run license:generate "my-product" 1 "CUSTOM-KEY-12345"
```

Or if using Docker:

```bash
docker exec license-api bun run scripts/generate-license.ts "my-product" 5
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/v1/license/activate` - Activate a license key
- `POST /api/v1/license/verify` - Verify an activation token

### Example Request

```json
{
  "licenseKey": "your-license-key-here",
  "hardwareId": "unique-hardware-id",
  "productId": "your-product-id"
}
```

### Example Response

```json
{
  "success": true,
  "token": "activation-token-uuid"
}
```

### Verify License Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/license/verify \
  -H "Content-Type: application/json" \
  -d '{
    "activationToken": "activation-token-uuid"
  }'
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "productId": "test-product",
  "status": "activated",
  "activatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Testing the API

1. First, generate a test license key:
   ```bash
   bun run license:generate "test-product" 1 "TEST-KEY-12345"
   ```

2. Then test the activation endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/v1/license/activate \
     -H "Content-Type: application/json" \
     -d '{
       "licenseKey": "TEST-KEY-12345",
       "hardwareId": "HW-12345678",
       "productId": "test-product"
     }'
   ```

