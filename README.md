# Text to Speech - ElevenLabs

A beautiful single-page web application that converts text to speech using ElevenLabs API with a specific voice. Deployed on Vercel with secure serverless functions.

## Features

- 🎤 Clean, modern UI with gradient design
- 📝 Text input with character limit (5000 characters)
- 🔐 Secure API key storage via Vercel environment variables
- 🔊 Audio playback with auto-play
- ⚡ Real-time status updates
- 🎨 Responsive design
- ☁️ Serverless API route for secure API key handling

## Setup

### Local Development

1. Clone this repository
2. Install Vercel CLI: `npm i -g vercel`
3. Create a `.env.local` file with your ElevenLabs API key:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```
4. Run `vercel dev` to start the development server
5. Open the application in your browser

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add the environment variable:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `ELEVENLABS_API_KEY` with your ElevenLabs API key value
4. Deploy!

## Voice ID

The application uses the voice ID: `wFzdaipEHKrAyjK9EKuv`

## Getting Your API Key

1. Sign up or log in to [ElevenLabs](https://elevenlabs.io)
2. Go to your profile settings
3. Copy your API key
4. Add it as a Vercel environment variable (see Setup section)

## Usage

- Type your text in the textarea
- Press "Send" or press Enter (Shift+Enter for new line)
- The audio will be generated and played automatically
- Use "Clear" to reset the text input

## Project Structure

```
.
├── api/
│   └── tts.js          # Serverless function for ElevenLabs API
├── index.html          # Main application UI
└── README.md           # This file
```

## Environment Variables

- `ELEVENLABS_API_KEY` - Your ElevenLabs API key (required)

## Notes

- The API key is stored securely in Vercel environment variables
- Audio files are generated on-demand from ElevenLabs servers
- Maximum text length: 5000 characters
- The serverless function handles all API communication securely
