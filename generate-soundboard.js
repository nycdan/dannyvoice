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

const apiKey = process.env.FINEVOICE_API_KEY;
const voiceModel = process.env.FINEVOICE_VOICE_MODEL || 'danny21-321536';

if (!apiKey) {
    console.error('Error: FINEVOICE_API_KEY environment variable is not set');
    console.error('Please set it with: export FINEVOICE_API_KEY=your_key_here');
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

        const ttsUrl = 'https://converter.fineshare.net/api/fsmstexttospeech';
        const ttsResponse = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                engine: 'gpt-api',
                appId: '107',
                featureId: '22',
                speech: phrase.trim(),
                voice: voiceModel,
                ChangerType: 3,
                designUuid: null,
                platform: `web-app-tts-${voiceModel}`,
                Parameter: {
                    speed: 1,
                    languageCode: 'en-US',
                    outputSpeed: 1,
                    outputGender: 1,
                    name: voiceModel,
                    ssml: false,
                    effect: null,
                    amotion: 'normal',
                    pitch: 0,
                    temperature: 0.9,
                    top_p: 0.9
                }
            })
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error?.message || `API error: ${ttsResponse.statusText}`);
        }

        const ttsJson = await ttsResponse.json();
        const uuid = ttsJson.uuid;

        if (!uuid) {
            throw new Error('FineVoice API did not return a task uuid');
        }

        // Poll for completion
        const pollUrl = `https://voiceai.fineshare.net/api/checkfilechangestatus/${uuid}`;
        const maxAttempts = 60;
        const pollIntervalMs = 500;
        let pollResult = null;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const pollResponse = await fetch(pollUrl);

            if (!pollResponse.ok) {
                await new Promise(r => setTimeout(r, pollIntervalMs));
                continue;
            }

            const pollJson = await pollResponse.json();
            if (pollJson.status === 3 && pollJson.url) {
                pollResult = pollJson;
                break;
            }

            await new Promise(r => setTimeout(r, pollIntervalMs));
        }

        if (!pollResult || !pollResult.url) {
            throw new Error('FineVoice audio generation timed out');
        }

        const audioResponse = await fetch(pollResult.url);
        if (!audioResponse.ok) {
            throw new Error('Failed to fetch generated audio');
        }

        const audioBuffer = await audioResponse.arrayBuffer();
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
    console.log('Starting soundboard audio generation (FineVoice 2.1)...\n');
    console.log(`Voice: ${voiceModel}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const { phrase, filename } of phrases) {
        const success = await generateAudio(phrase, filename);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        // Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
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
