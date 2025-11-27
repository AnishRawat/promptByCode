# PromptByCode ⚡

Transform your codebase into AI-ready context. A powerful tool to generate comprehensive summaries of your code files using cutting-edge AI models.

## 🌟 Features

- 📁 **Multi-File Upload**: Upload entire folders or individual files
- 🤖 **Multiple AI Models**: Choose from Groq (Llama, Mixtral, Qwen) or Google Gemini models
- 🎨 **Beautiful UI**: Modern, responsive design with multiple themes (Dark, Light, Snow, Rain, Cloudy, Sunny)
- 🌤️ **Weather-Based Themes**: Auto theme adapts to your local weather conditions
- 📝 **Formatted Output**: Colorful markdown rendering with syntax highlighting
- 💾 **Session Memory**: Your selections persist across page refreshes
- 🔄 **Real-time Processing**: Instant summarization with progress indicators

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Vercel CLI** (for development)
- API Keys:
  - Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
  - Groq API Key ([Get one here](https://console.groq.com/keys))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd PromptByCode
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run Development Server

```bash
npx vercel dev
```

The application will be available at `http://localhost:3000`

## 📦 Dependencies

### Root Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "axios": "^1.7.7",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "groq-sdk": "^0.36.0",
  "multer": "^2.0.2",
  "uuid": "^13.0.0",
  "winston": "^3.18.3"
}
```

### Frontend Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-icons": "^5.5.0",
  "prismjs": "^1.30.0",
  "vite": "^7.2.2"
}
```

## 🎯 Available AI Models

### Groq Models
- **Llama 3.3 70B Versatile** - Best for complex reasoning
- **Llama 3.1 8B Instant** - Ultra fast, low cost
- **Qwen 3 32B** - Great for creative tasks and rewriting

### Google Gemini Models
- **Gemini 1.5 Flash** - Fast and efficient
- **Gemini 1.5 Pro** - Complex reasoning and analysis

## 🎨 Themes

1. **Dark** - Classic dark mode
2. **Light** - Clean light mode
3. **Auto** - Weather-based theme (requires geolocation)
4. **Snow** - Cool winter vibes
5. **Rain** - Cozy rainy day
6. **Cloudy** - Soft overcast
7. **Sunny** - Bright and vibrant

## 📖 Usage

1. **Upload Files**: Click "Folder" or "Files" button to select your codebase
2. **Select Files**: Choose specific files from the file tree
3. **Pick a Model**: Select your preferred AI model from the dropdown
4. **Add Instructions** (Optional): Provide custom instructions for the AI
5. **Generate**: Click "Generate Context" and watch the magic happen!
6. **Copy**: Use the copy button to save the formatted output

## 🏗️ Project Structure

```
PromptByCode/
├── api/                      # Serverless API functions
│   ├── summarize.js         # Main summarization endpoint
│   └── weather-theme.js     # Weather-based theme API
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.jsx         # Main application
│   └── package.json
├── .env                     # Environment variables (create this)
├── package.json            # Root dependencies
└── vercel.json            # Vercel configuration
```

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI if you haven't:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

### API Keys Not Working
- Verify `.env` file is in root directory
- Check API key validity on respective platforms
- Restart development server after adding keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Google Gemini](https://ai.google.dev/) and [Groq](https://groq.com/)
- Deployed on [Vercel](https://vercel.com/)
- Weather data from [Open-Meteo](https://open-meteo.com/)

---

Made with ❤️ by the PromptByCode Team
