# License Service

A secure, scalable license activation service built with Elysia, Drizzle ORM, and MySQL.

## Features

- 🔐 **Secure License Activation** - Hardware ID binding with bcrypt hashing
- 🔒 **One Device Per License** - Prevents license sharing across devices
- 🚀 **High Performance** - Built with Bun runtime and connection pooling
- 📝 **API Documentation** - Auto-generated Swagger docs
- 🐳 **Docker Ready** - Complete Docker Compose setup
- ✅ **Type Safe** - Full TypeScript support

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Bun runtime (optional, for local development)

### Start Everything

```bash
cd infrastructure
docker-compose up -d
```

This starts:
- MySQL database (port 3307)
- phpMyAdmin (port 8080)
- License Service API (port 3000)

### Initialize Database

```bash
docker exec license-api bun run db:push
```

### Generate License Keys

```bash
# Generate 5 license keys for a product
docker exec license-api bun run scripts/generate-license.ts "my-product" 5
```

### Access Services

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/swagger
- **Health Check**: http://localhost:3000/health
- **Admin Dashboard**: http://localhost:5173 (see Frontend Setup)
- **phpMyAdmin**: http://localhost:8080

### Frontend Setup (Admin Dashboard)

```bash
cd client-products
npm install
npm run dev
```

Access the admin dashboard at http://localhost:5173

### Native Desktop Client Setup

```bash
cd NativeLicenseService
npm install
npm run dev  # Development mode
```

To build installers:
```bash
npm run build:win      # Build .exe installer
npm run build:win:msi  # Build MSI installer
```

See `NativeLicenseService/README.md` for detailed instructions.

## Features

### Backend APIs
- **License Activation** - Activate licenses with hardware ID binding
- **License Verification** - Verify activation tokens
- **Product Management** - CRUD operations for products
- **Admin License Management** - Full license management with enable/disable
- **Support Center** - Search licenses by various criteria

### Frontend Dashboard
- **Products Management** - Create, edit, delete, enable/disable products
- **License Management** - Full CRUD with status management
- **Support Center** - Search and view license information

### Native Desktop Client
- **Electron App** - Desktop application for license activation
- **Hardware ID Detection** - Automatic device identification
- **License Activation** - Activate licenses with hardware binding
- **License Verification** - Verify existing activation tokens
- **Installer Packages** - .exe and MSI installers for distribution

## API Endpoints

### Activate License

```bash
POST /api/v1/license/activate
```

**Request:**
```json
{
  "licenseKey": "YOUR-LICENSE-KEY",
  "hardwareId": "unique-hardware-id",
  "productId": "your-product-id"
}
```

**Response:**
```json
{
  "success": true,
  "token": "activation-token-uuid"
}
```

### Verify License

```bash
POST /api/v1/license/verify
```

**Request:**
```json
{
  "activationToken": "activation-token-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "productId": "your-product-id",
  "status": "activated",
  "activatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
/license-service
├── /src
│   ├── /db              # Database schema and connection
│   ├── /modules
│   │   ├── /license     # License activation/verification
│   │   ├── /product     # Product management
│   │   ├── /admin       # Admin license management
│   │   └── /support     # Support center
│   └── index.ts         # Main server file
├── /client-products     # React admin dashboard frontend
│   ├── /src
│   │   ├── /pages       # Products, Licenses, Support pages
│   │   └── api.ts       # API client
│   └── package.json
├── /NativeLicenseService  # Electron desktop client app
│   ├── /src
│   │   ├── /main        # Electron main process
│   │   └── /renderer   # UI (HTML/CSS/TS)
│   └── package.json
├── /scripts
│   └── generate-license.ts  # License key generation utility
├── /infrastructure
│   └── docker-compose.yml   # Docker services
├── SETUP.md             # Detailed setup guide
└── ADMIN_GUIDE.md        # Admin dashboard guide
```

## Development

### Local Development (Without Docker)

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start database:
   ```bash
   cd infrastructure
   docker-compose up -d mysql-db
   ```

3. Create `.env` file:
   ```env
   DATABASE_URL="mysql://license_user:license_pass_123@localhost:3307/license_db"
   PORT=3000
   ```

4. Initialize database:
   ```bash
   bun run db:push
   ```

5. Run development server:
   ```bash
   bun run dev
   ```

## Security Features

- **Hardware ID Hashing**: HWIDs are hashed with bcrypt before storage
- **Input Validation**: All inputs validated with TypeBox schemas
- **Transaction Safety**: Database operations use transactions
- **Error Handling**: Comprehensive error handling and logging

## Production Deployment

1. Update passwords in `infrastructure/docker-compose.yml`
2. Set strong passwords for MySQL
3. Use HTTPS with reverse proxy (Nginx/Traefik)
4. Configure proper firewall rules
5. Set up monitoring and logging

## License

This project is provided as-is for license management purposes.
