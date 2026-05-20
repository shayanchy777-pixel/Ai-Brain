# Ai-Journal - Personal AI Assistant

A modern, full-featured personal AI journal and assistant application built with React, Vite, and Gemini API.

## Features

- 📝 **Voice-to-Text Notes** - Record voice notes that are automatically transcribed
- 🤖 **AI Chat** - Chat with Gemini AI for insights and assistance
- 📚 **Knowledge Base** - Store and organize important information
- 📊 **Dashboard** - Overview of your notes and activity
- 🎨 **Dark Theme** - Modern, sleek UI with purple/blue accents
- 📱 **Responsive** - Works on desktop and mobile

## Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment

Create `.env.local`:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key: https://ai.google.dev/

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173/

## Usage

### Adding Notes

1. Click the **`+` button** (bottom right)
2. Type or click **"Start Voice"** to record
3. Click **"Save Note"**

### Voice Recording

- Uses **Web Speech API** (built-in, no extra setup needed)
- Automatic real-time transcription
- Works in Chrome, Firefox, Safari, Edge

### Chat with AI

1. Go to **Chat** section
2. Type your question
3. Get responses from Gemini AI

## Project Structure

```
Ai-Journal/
├── frontend/
│   └── src/
│       ├── components/      # Reusable components
│       ├── pages/          # Page components
│       ├── App.jsx         # Main app component
│       └── index.css       # Global styles
├── backend/
│   └── server.js           # Express server
├── package.json
├── vite.config.js
└── index.html
```

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/chat` - Send message to Gemini
- `POST /api/transcribe` - Transcribe audio

## Technologies

- **Frontend**: React, Vite, Lucide Icons
- **Backend**: Express.js
- **AI**: Google Gemini API
- **Storage**: LocalStorage (browser)
- **Styling**: CSS3 with Gradients & Animations

## License

MIT
