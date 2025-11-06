# License Management Frontend

React-based admin dashboard and support center for managing products and licenses.

## Features

- **Products Management**: Create, edit, delete, and enable/disable products
- **License Management**: Full CRUD operations for license keys with status management
- **Support Center**: Search licenses by various criteria (license key, activation token, customer info, product)

## Setup

1. Install dependencies:
```bash
cd client-products
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Endpoints Used

- `/api/v1/products` - Product management
- `/api/v1/admin/licenses` - License management (admin)
- `/api/v1/support/search` - Support center search
- `/api/v1/support/stats` - License statistics

## Development

The frontend uses Vite for fast development. The proxy is configured to forward `/api` requests to the backend at `http://localhost:3000`.

