# Danny Voice

A beautiful single-page web application that converts text to speech using FineVoice (2.1), Cartesia.ai, Resemble AI (2.0), or ElevenLabs (1.0) with a specific voice. Deployed on Vercel with secure serverless functions.

## Features

- 🎤 Clean, modern UI with gradient design
- 📝 Text input with character limit (5000 characters)
- 🔄 Provider toggle at bottom: FineVoice (default) or Cartesia.ai
- 😀 Emoji-to-emotion tags for expressive speech (works with all providers)
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

   # Required for Danny 2.1 (FineVoice)
   FINEVOICE_API_KEY=your_finevoice_api_key_here

   # Required for Cartesia.ai (toggle at bottom)
   CARTESIA_API_KEY=your_cartesia_api_key_here
   CARTESIA_VOICE_ID=your_voice_id_here

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
   - Add `FINEVOICE_API_KEY` for Danny 2.1 (optional: `FINEVOICE_VOICE_MODEL`, default: `danny21-321536`)
   - Add `CARTESIA_API_KEY` and `CARTESIA_VOICE_ID` for Cartesia.ai
   - Add `ELEVENLABS_API_KEY` for Danny 1.0 fallback
4. Deploy!

## Provider Toggle

A toggle at the bottom of the page switches between:

- **FineVoice (2.1)** - Default. Uses FineVoice.ai with plain text (emotion tags stripped).
- **Cartesia** - Uses Cartesia.ai with Sonic-3 model. Supports Hebrew and English.

Your selection is saved in `localStorage` and persists across sessions.

## Voice Configuration

- **ElevenLabs (1.0)**: Voice ID `wFzdaipEHKrAyjK9EKuv`
- **Resemble (2.0)**: Set `RESEMBLE_VOICE_UUID` to your custom voice UUID from the [Resemble dashboard](https://app.resemble.ai)
- **FineVoice (2.1)**: Set `FINEVOICE_VOICE_MODEL` (optional, default: `danny21-321536`) from [FineVoice](https://finevoice.ai/usercenter)
- **Cartesia**: Set `CARTESIA_VOICE_ID` (optional; uses a default preview voice if not set). Get voice IDs from [Cartesia dashboard](https://play.cartesia.ai) or API

## Getting API Keys

### Resemble (Danny 2.0)
1. Sign up or log in at [Resemble AI](https://resemble.ai)
2. Create or select a voice and copy its UUID
3. Get your API token from [Account Settings](https://app.resemble.ai/account/api)

### FineVoice (Danny 2.1)
1. Sign up or log in at [FineVoice](https://finevoice.ai)
2. Go to [User Center](https://finevoice.ai/usercenter) > API Tokens
3. Generate Secret Key

### Cartesia
1. Sign up or log in at [Cartesia](https://cartesia.ai)
2. Get your API key from the [dashboard](https://play.cartesia.ai)
3. Copy a voice ID from the voice library or create a clone

### ElevenLabs (Danny 1.0)
1. Sign up or log in at [ElevenLabs](https://elevenlabs.io)
2. Go to your profile settings
3. Copy your API key

## Usage

- Type your text in the textarea
- Use the emoji picker to add emotion tags (excited, calm, laughs, etc.)
- Use the toggle at the bottom to select FineVoice or Cartesia
- Press "Send" or press Enter (Shift+Enter for new line)
- The audio will be generated and played automatically
- Use "Clear" to reset the text input

## Generating Soundboard Audio Files

The soundboard uses pre-generated MP3 files. To regenerate them with FineVoice (2.1):

1. Make sure you have Node.js 18+ installed (for fetch API support)
2. Set your FineVoice API key:

   ```bash
   export FINEVOICE_API_KEY=your_api_key_here
   ```
   Optionally set `FINEVOICE_VOICE_MODEL` (default: `danny21-321536`)

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
│   └── tts.js          # Serverless function for FineVoice, Cartesia, Resemble & ElevenLabs API
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
- `FINEVOICE_API_KEY` - FineVoice API key (required for Danny 2.1)
- `FINEVOICE_VOICE_MODEL` - FineVoice voice model (optional, default: `danny21-321536`)
- `CARTESIA_API_KEY` - Cartesia API key (required for Cartesia provider)
- `CARTESIA_VOICE_ID` - Cartesia voice ID (optional; uses default preview voice if not set)
- `ELEVENLABS_API_KEY` - ElevenLabs API key (required for Danny 1.0)

## Notes

- API keys are stored securely in Vercel environment variables
- Audio files are generated on-demand from Resemble, FineVoice, or ElevenLabs servers
- FineVoice 2.1 uses an async workflow (may add 1-5 seconds latency)
- Maximum text length: 5000 characters
- The serverless function handles all API communication securely
