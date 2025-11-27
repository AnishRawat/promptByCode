# PromptByCode - Installation Guide

## System Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Installation Steps

### 1. Install Node.js and npm
```bash
# Verify Node.js installation
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

If not installed, download from: https://nodejs.org/

### 2. Clone Repository
```bash
git clone <repository-url>
cd PromptByCode
```

### 3. Install Root Dependencies
```bash
npm install
```

This will install the following packages:
- @google/generative-ai@^0.24.1
- axios@^1.7.7
- cors@^2.8.5
- dotenv@^17.2.3
- express@^5.1.0
- groq-sdk@^0.36.0
- multer@^2.0.2
- uuid@^13.0.0
- winston@^3.18.3

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

This will install:
- react@^19.2.0
- react-dom@^19.2.0
- react-icons@^5.5.0
- prismjs@^1.30.0
- vite@^7.2.2
- @vitejs/plugin-react@^5.1.0
- (and other dev dependencies)

### 5. Install Vercel CLI (Development Server)
```bash
npm install -g vercel
```

### 6. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
touch .env
```

Add the following content:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GROQ_API_KEY=your_actual_groq_api_key_here
```

**Get your API keys:**
- Gemini: https://makersuite.google.com/app/apikey
- Groq: https://console.groq.com/keys

### 7. Run Development Server
```bash
npx vercel dev
```

The application will start at: http://localhost:3000

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
cd ..
```

### Deploy to Vercel
```bash
vercel --prod
```

Don't forget to set environment variables in Vercel Dashboard:
- Project Settings → Environment Variables
- Add `GEMINI_API_KEY` and `GROQ_API_KEY`

## Verification

After installation, verify everything works:

1. Open http://localhost:3000
2. Upload a test folder with code files
3. Select a few files
4. Choose an AI model (e.g., Gemini 1.5 Flash)
5. Click "Generate Context"
6. Verify the summary appears with proper formatting

## Troubleshooting

### Issue: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules frontend/node_modules package-lock.json frontend/package-lock.json
npm install
cd frontend && npm install && cd ..
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill -9
```

### Issue: "API Key Invalid"
**Solution:**
- Double-check `.env` file exists in root directory
- Verify API keys are correct (no extra spaces)
- Restart the development server: `Ctrl+C` then `npx vercel dev`

### Issue: Weather theme not working
**Solution:**
- Grant location permissions in your browser
- Check if `/api/weather-theme` endpoint is accessible
- Fallback: Switch to "Dark" or "Light" theme manually

## Quick Command Reference

```bash
# Install all dependencies
npm install && cd frontend && npm install && cd ..

# Start development server
npx vercel dev

# Build for production
cd frontend && npm run build && cd ..

# Deploy to production
vercel --prod

# Clear cache and reinstall
rm -rf node_modules frontend/node_modules && npm install && cd frontend && npm install && cd ..
```

## Support

For issues, please check:
1. This installation guide
2. Main README.md
3. Project GitHub issues

Happy coding! 🚀
