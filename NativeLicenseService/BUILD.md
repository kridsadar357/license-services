# Building the Native License Client

## Prerequisites

1. **Node.js 18+** installed
2. **License Service API** running (for testing)
3. **Windows** (for building Windows installers)

## Development Setup

1. Install dependencies:
```bash
cd NativeLicenseService
npm install
```

2. Start development mode:
```bash
npm run dev
```

This will:
- Compile TypeScript files
- Start Vite dev server for renderer
- Launch Electron app
- Enable hot-reload

## Building Installers

### Build .exe Installer (NSIS)

```bash
npm run build:win
```

This creates:
- `release/License Client Setup x.x.x.exe` - NSIS installer

**Features:**
- Custom installation directory selection
- Start menu shortcuts
- Uninstaller included

### Build MSI Installer

```bash
npm run build:win:msi
```

This creates:
- `release/License Client x.x.x.msi` - MSI installer

**Features:**
- Windows Installer format
- Suitable for enterprise deployment
- Group Policy compatible

## Configuration

### Change API URL

Before building, you can set the API URL:

1. **Environment Variable** (recommended for production):
```bash
set API_URL=https://your-api-domain.com
npm run build:win
```

2. **Edit Source Code**:
Edit `src/main/main.ts`:
```typescript
const API_URL = 'https://your-api-domain.com';
```

### App Information

Edit `package.json` to customize:
- `name` - Package name
- `version` - Version number
- `description` - App description
- `build.appId` - Unique app identifier
- `build.productName` - Display name

## Distribution

After building, distribute:
- **NSIS Installer** (`.exe`) - For end users
- **MSI Installer** (`.msi`) - For enterprise/IT deployment

Both installers are 64-bit Windows executables.

## Testing the Build

1. Install the built installer on a test machine
2. Run the application
3. Test license activation with a valid license key
4. Verify hardware ID detection
5. Test license verification

## Troubleshooting

**Build fails?**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules dist release && npm install`

**App doesn't connect to API?**
- Verify API URL is correct
- Check if API is accessible from the client machine
- Ensure firewall allows connections
- Check API CORS settings

**Hardware ID issues?**
- Hardware ID is generated from system info
- Should be unique per device
- If issues occur, check network interfaces are accessible

