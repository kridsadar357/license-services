# Development Guide - Native License Client

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- License Service API running at http://localhost:3000 (or configure API_URL)

## Setup

1. **Install Dependencies**:
```bash
cd NativeLicenseService
npm install
```

This will install:
- Electron (desktop app framework)
- Electron Builder (for creating installers)
- TypeScript (for type safety)
- Vite (for renderer build)
- Axios (for API calls)

## Development Workflow

### Start Development Mode

```bash
npm run dev
```

This command:
1. Compiles TypeScript files in watch mode (main & preload)
2. Starts Vite dev server for renderer (port 5174)
3. Waits for Vite to be ready
4. Launches Electron app

### Development Structure

- **Main Process** (`src/main/main.ts`): Electron main process, handles IPC
- **Preload Script** (`src/main/preload.ts`): Secure bridge between main and renderer
- **Renderer** (`src/renderer/`): UI code (HTML, CSS, TypeScript)

### Making Changes

1. **Main Process Changes**: Edit `src/main/main.ts` or `preload.ts`
   - TypeScript auto-compiles on save
   - Restart Electron to see changes (close and reopen app)

2. **Renderer Changes**: Edit files in `src/renderer/`
   - Vite hot-reloads automatically
   - Changes appear immediately in the Electron window

3. **API Changes**: Update `API_URL` in `src/main/main.ts` if needed

## Testing

### Test License Activation

1. Ensure License Service API is running
2. Have a valid product and license key ready
3. Run `npm run dev`
4. Enter license information in the app
5. Click "Activate License"
6. Verify activation token is received

### Test License Verification

1. Use an existing activation token
2. Enter token in "Verify Existing License" section
3. Click "Verify License"
4. Verify status is displayed correctly

## Building

### Development Build

```bash
npm run build
```

This compiles all TypeScript and builds the renderer, but doesn't create installers.

### Production Builds

#### NSIS Installer (.exe)
```bash
npm run build:win
```

Creates: `release/License Client Setup x.x.x.exe`

#### MSI Installer
```bash
npm run build:win:msi
```

Creates: `release/License Client x.x.x.msi`

## Troubleshooting

### Electron doesn't start
- Check if port 5174 is available
- Verify all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### API connection fails
- Verify API is running: `curl http://localhost:3000/health`
- Check API_URL in `src/main/main.ts`
- Verify CORS is enabled on the API

### Build fails
- Clear cache: `rm -rf node_modules dist release && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all dependencies: `npm list`

### Hardware ID issues
- Hardware ID is generated from system info
- Should be unique per device
- Check network interfaces are accessible

## Code Structure

```
src/
├── main/
│   ├── main.ts      # Main Electron process
│   └── preload.ts   # IPC bridge
└── renderer/
    ├── index.html   # UI structure
    ├── styles.css   # Styling
    └── main.ts      # UI logic
```

## IPC Communication

The app uses Electron's IPC for secure communication:

**Main Process → Renderer**:
- `get-hardware-id`: Returns device hardware ID
- `activate-license`: Activates license via API
- `verify-license`: Verifies activation token

**Renderer → Main**:
- Calls via `window.electronAPI.*` methods
- All communication is type-safe via TypeScript

## Environment Variables

- `API_URL`: License service API URL (default: http://localhost:3000)
- `NODE_ENV`: Set to 'development' for dev mode

## Next Steps

1. Customize app branding in `package.json`
2. Add app icon (create `assets/icon.ico` for Windows)
3. Configure API URL for production
4. Build installers for distribution

