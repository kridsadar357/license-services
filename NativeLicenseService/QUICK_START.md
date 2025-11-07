# Quick Start - Native License Client

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd NativeLicenseService
npm install
```

### 2. Start Development

Make sure your License Service API is running at http://localhost:3000, then:

```bash
npm run dev
```

This will:
- ✅ Compile TypeScript
- ✅ Start the Electron app
- ✅ Open the license activation window

### 3. Build Installers

#### For .exe Installer:
```bash
npm run build:win
```

#### For MSI Installer:
```bash
npm run build:win:msi
```

Installers will be in the `release/` folder.

## 📝 Usage

1. **Enter License Information**:
   - Product ID (e.g., "my-product")
   - License Key (from your license service)
   - Optional: Customer name and email

2. **Hardware ID** is automatically detected

3. **Click "Activate License"**

4. **Save your Activation Token** for future verification

## 🔧 Configuration

### Change API URL

Before building, edit `src/main/main.ts`:

```typescript
const API_URL = 'https://your-production-api.com';
```

Or set environment variable:

```bash
set API_URL=https://your-api.com
npm run build:win
```

## 📦 What You Get

After building:
- **License Client Setup.exe** - NSIS installer (user-friendly)
- **License Client.msi** - MSI installer (enterprise-friendly)

Both are ready to distribute to your clients!

