# Native License Client

Electron-based desktop application for license activation and verification.

## Features

- 🔐 **License Activation** - Activate licenses with hardware ID binding
- ✅ **License Verification** - Verify existing activation tokens
- 🖥️ **Hardware ID Detection** - Automatic hardware ID generation
- 📦 **Native Packaging** - Build as .exe or MSI installer
- 🎨 **Modern UI** - Clean, user-friendly interface

## Development

### Prerequisites

- Node.js 18+ and npm
- License Service API running (http://localhost:3000)

### Setup

1. Install dependencies:
```bash
cd NativeLicenseService
npm install
```

2. Start development:
```bash
npm run dev
```

This will:
- Start the Electron app
- Open DevTools automatically
- Hot-reload on changes

### Build for Production

#### Build .exe Installer (NSIS)
```bash
npm run build:win
```

#### Build MSI Installer
```bash
npm run build:win:msi
```

Output files will be in the `release` directory.

## Configuration

### API URL

By default, the app connects to `http://localhost:3000`. To change this:

1. Set environment variable:
```bash
set API_URL=http://your-api-url:3000
npm start
```

2. Or modify `src/main/main.ts`:
```typescript
const API_URL = 'http://your-api-url:3000';
```

## Usage

1. **Activate License**:
   - Enter Product ID
   - Enter License Key
   - (Optional) Enter customer name and email
   - Click "Activate License"
   - Hardware ID is automatically detected

2. **Verify License**:
   - Enter Activation Token
   - Click "Verify License"
   - View license status

## Project Structure

```
NativeLicenseService/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main process entry
│   │   └── preload.ts  # Preload script
│   └── renderer/       # UI (HTML/CSS/JS)
│       ├── index.html
│       ├── styles.css
│       └── main.ts
├── dist/               # Compiled output
└── release/            # Built installers
```

## Packaging

The app uses `electron-builder` for packaging:

- **NSIS Installer** (.exe) - Windows installer with custom installation directory
- **MSI Installer** - Windows MSI package

Both installers are 64-bit and can be distributed to clients.

## Hardware ID

The app automatically generates a hardware ID based on:
- Computer hostname
- Operating system platform
- CPU architecture
- Primary MAC address

This ensures each device has a unique identifier for license binding.

