const fs = require('fs');
const path = require('path');

// Soundboard phrases
const phrases = [
    { phrase: 'Hi how are you?', filename: 'hi-how-are-you.mp3' },
    { phrase: 'Good morning!', filename: 'good-morning.mp3' },
    { phrase: 'Please come here', filename: 'please-come-here.mp3' },
    { phrase: 'I need help', filename: 'i-need-help.mp3' },
    { phrase: 'Please', filename: 'please.mp3' },
    { phrase: 'I love you', filename: 'i-love-you.mp3' },
    { phrase: "I'm hungry", filename: 'im-hungry.mp3' },
    { phrase: "I'm thirsty", filename: 'im-thirsty.mp3' },
    { phrase: "I'm tired", filename: 'im-tired.mp3' },
    { phrase: "I'm cold", filename: 'im-cold.mp3' }
];

const voiceId = 'wFzdaipEHKrAyjK9EKuv';
const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
    console.error('Please set it with: export ELEVENLABS_API_KEY=your_key_here');
    process.exit(1);
}

const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

async function generateAudio(phrase, filename) {
    try {
        console.log(`Generating audio for: "${phrase}" -> ${filename}`);
        
        // First, get voice settings
        const voiceUrl = `https://api.elevenlabs.io/v1/voices/${voiceId}`;
        const voiceResponse = await fetch(voiceUrl, {
            headers: {
                'xi-api-key': apiKey
            }
        });
        
        let voiceSettings = {
            stability: 0.5,
            similarity_boost: 0.75
        };
        
        if (voiceResponse.ok) {
            const voiceData = await voiceResponse.json();
            if (voiceData.settings) {
                voiceSettings = voiceData.settings;
            }
        }
        
        // Generate audio
        const requestBody = {
            text: phrase.trim(),
            model_id: 'eleven_v3',
            voice_settings: voiceSettings
        };
        
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail?.message || `API error: ${response.statusText}`);
        }

        // Get the audio buffer
        const audioBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(audioBuffer);
        
        // Save to public directory
        const filePath = path.join(publicDir, filename);
        fs.writeFileSync(filePath, buffer);
        
        console.log(`✓ Saved: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
        return true;
        
    } catch (error) {
        console.error(`✗ Error generating "${phrase}":`, error.message);
        return false;
    }
}

async function generateAll() {
    console.log('Starting soundboard audio generation...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const { phrase, filename } of phrases) {
        const success = await generateAudio(phrase, filename);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n=== Generation Complete ===`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`\nFiles saved to: ${publicDir}`);
}

generateAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
