# Text to Speech - ElevenLabs

A beautiful single-page web application that converts text to speech using ElevenLabs API with a specific voice.

## Features

- 🎤 Clean, modern UI with gradient design
- 📝 Text input with character limit (5000 characters)
- 🔐 Secure API key storage (saved in browser localStorage)
- 🔊 Audio playback with auto-play
- ⚡ Real-time status updates
- 🎨 Responsive design

## Setup

1. Open `index.html` in your web browser
2. Enter your ElevenLabs API key in the input field
3. Type the text you want to convert
4. Click "Send" to generate and play the audio

## Voice ID

The application uses the voice ID: `wFzdaipEHKrAyjK9EKuv`

## Getting Your API Key

1. Sign up or log in to [ElevenLabs](https://elevenlabs.io)
2. Go to your profile settings
3. Copy your API key
4. Paste it into the application

## Usage

- Type your text in the textarea
- Press "Send" or press Enter (Shift+Enter for new line)
- The audio will be generated and played automatically
- Use "Clear" to reset the text input

## Browser Compatibility

Works in all modern browsers that support:
- Fetch API
- Audio playback
- LocalStorage

## Notes

- The API key is stored locally in your browser (localStorage)
- Audio files are generated on-demand from ElevenLabs servers
- Maximum text length: 5000 characters
