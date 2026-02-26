# Danny Voice

A beautiful single-page web application that converts text to speech using Resemble AI (2.0) or ElevenLabs (1.0) with a specific voice. Deployed on Vercel with secure serverless functions.

## Features

- 🎤 Clean, modern UI with gradient design
- 📝 Text input with character limit (5000 characters)
- 🔄 Version toggle: Danny 2.0 (Resemble) by default, switch to 1.0 (ElevenLabs)
- 😀 Emoji-to-emotion tags for expressive speech (works with both providers)
- 🔐 Secure API key storage via Vercel environment variables
- 🔊 Audio playback with auto-play
- ⚡ Real-time status updates
- 🎨 Responsive design
- ☁️ Serverless API route for secure API key handling

## Setup

### Local Development

1. Clone this repository
2. Install Vercel CLI: `npm i -g vercel`
3. Create a `.env.local` file with your API keys:
   ```
   # Required for Danny 2.0 (Resemble - default)
   RESEMBLE_API_KEY=your_resemble_api_key_here
   RESEMBLE_VOICE_UUID=your_resemble_voice_uuid_here

   # Required for Danny 1.0 (ElevenLabs)
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```
4. Run `vercel dev` to start the development server
5. Open the application in your browser

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add the environment variables:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `RESEMBLE_API_KEY` and `RESEMBLE_VOICE_UUID` for Danny 2.0
   - Add `ELEVENLABS_API_KEY` for Danny 1.0 fallback
4. Deploy!

## Version Toggle

- **Danny 2.0 (Resemble)** - Default. Uses Resemble AI with Chatterbox-Turbo model and SSML emotion tags.
- **Danny 1.0 (ElevenLabs)** - Toggle to use ElevenLabs with v3 emotion tags.

Your version preference is saved in `localStorage` and persists across sessions.

## Voice Configuration

- **ElevenLabs (1.0)**: Voice ID `wFzdaipEHKrAyjK9EKuv`
- **Resemble (2.0)**: Set `RESEMBLE_VOICE_UUID` to your custom voice UUID from the [Resemble dashboard](https://app.resemble.ai)

## Getting API Keys

### Resemble (Danny 2.0)
1. Sign up or log in at [Resemble AI](https://resemble.ai)
2. Create or select a voice and copy its UUID
3. Get your API token from [Account Settings](https://app.resemble.ai/account/api)

### ElevenLabs (Danny 1.0)
1. Sign up or log in at [ElevenLabs](https://elevenlabs.io)
2. Go to your profile settings
3. Copy your API key

## Usage

- Type your text in the textarea
- Use the emoji picker to add emotion tags (excited, calm, laughs, etc.)
- Select your version (2.0 Resemble or 1.0 ElevenLabs)
- Press "Send" or press Enter (Shift+Enter for new line)
- The audio will be generated and played automatically
- Use "Clear" to reset the text input

## Generating Soundboard Audio Files

The soundboard uses pre-generated MP3 files. To regenerate them:

1. Make sure you have Node.js 18+ installed (for fetch API support)
2. Set your ElevenLabs API key as an environment variable:
   ```bash
   export ELEVENLABS_API_KEY=your_api_key_here
   ```
3. Run the generation script:
   ```bash
   node generate-soundboard.js
   ```
4. The audio files will be saved to the `public/` directory

The script will generate 10 audio files:
- hi-how-are-you.mp3
- good-morning.mp3
- please-come-here.mp3
- i-need-help.mp3
- please.mp3
- i-love-you.mp3
- im-hungry.mp3
- im-thirsty.mp3
- im-tired.mp3
- im-cold.mp3

## Project Structure

```
.
├── api/
│   ├── log.js          # Logging endpoint
│   └── tts.js          # Serverless function for Resemble & ElevenLabs API
├── public/
│   ├── index.html      # Main application UI
│   ├── manifest.json   # PWA manifest
│   ├── sw.js          # Service worker
│   └── *.mp3          # Soundboard audio files (generated)
├── generate-soundboard.js  # Script to generate soundboard audio files
└── README.md           # This file
```

## Environment Variables

- `RESEMBLE_API_KEY` - Resemble API token (required for Danny 2.0)
- `RESEMBLE_VOICE_UUID` - Resemble voice UUID (required for Danny 2.0)
- `ELEVENLABS_API_KEY` - ElevenLabs API key (required for Danny 1.0)

## Notes

- API keys are stored securely in Vercel environment variables
- Audio files are generated on-demand from Resemble or ElevenLabs servers
- Maximum text length: 5000 characters
- The serverless function handles all API communication securely
