# Admin Dashboard & Support Center Guide

## Overview

A complete full-stack solution for managing products, licenses, and customer support.

## Backend APIs

### Products Management (`/api/v1/products`)
- `GET /api/v1/products` - List all products (with search)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Admin License Management (`/api/v1/admin/licenses`)
- `GET /api/v1/admin/licenses` - List all licenses (with filters: search, productId, status)
- `GET /api/v1/admin/licenses/:id` - Get license by ID
- `POST /api/v1/admin/licenses` - Create new license
- `PUT /api/v1/admin/licenses/:id` - Update license (status, notes)
- `PATCH /api/v1/admin/licenses/:id/toggle` - Enable/disable license
- `DELETE /api/v1/admin/licenses/:id` - Delete license

### Support Center (`/api/v1/support`)
- `GET /api/v1/support/search?type=...&value=...` - Search licenses
  - Types: `licenseKey`, `activationToken`, `customerEmail`, `customerName`, `productId`
- `GET /api/v1/support/stats` - Get license statistics

## Frontend

### Setup
```bash
cd client-products
npm install
npm run dev
```

Access at: http://localhost:5173

### Features

1. **Products Page** (`/`)
   - Create, edit, delete products
   - Enable/disable products
   - Search functionality
   - View product details

2. **Licenses Page** (`/licenses`)
   - Create, edit, delete licenses
   - Enable/disable licenses
   - Change license status (available, activated, expired, revoked)
   - Filter by product and status
   - Search licenses
   - View activation count

3. **Support Center** (`/support`)
   - Search by license key
   - Search by activation token
   - Search by customer email
   - Search by customer name
   - Search by product ID
   - View license statistics
   - Display detailed license and activation information

## Database Schema Updates

### New Tables
- `products` - Product information
  - id, name, description, productId (unique), enabled, createdAt, updatedAt

### Updated Tables
- `licenses` - Now references products table
  - Added: enabled, notes fields
  - Foreign key to products.productId

- `activations` - Added customer information
  - Added: customerEmail, customerName fields

## Usage Flow

1. **Create Products**: Go to Products page, click "Add Product"
2. **Create Licenses**: Go to Licenses page, select product, click "Add License"
3. **Manage Licenses**: Edit, enable/disable, change status, or delete licenses
4. **Support Queries**: Use Support Center to search by various criteria

## Security

- Products must be enabled for license activation
- Licenses must be enabled for activation
- Customer information is optional but stored for support purposes
- All validations are enforced at both frontend and backend

