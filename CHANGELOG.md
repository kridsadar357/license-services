# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-11-07

### Added
- Initial release of License Service
- License activation with hardware ID binding
- License verification endpoint
- Health check endpoint
- License key generation utility script
- Docker Compose setup with MySQL and phpMyAdmin
- Swagger API documentation
- Database schema with Drizzle ORM
- Security features:
  - Hardware ID hashing with bcrypt
  - Input validation with TypeBox
  - Transaction safety
  - One device per license enforcement

### Features
- `POST /api/v1/license/activate` - Activate a license key
- `POST /api/v1/license/verify` - Verify an activation token
- `GET /health` - Health check endpoint
- License generation script for creating license keys
- Complete Docker setup for easy deployment

