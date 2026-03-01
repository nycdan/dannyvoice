const fs = require('fs');
const path = require('path');

// Calling phrases - same structure as CALLING_PHRASES_DEFAULT
// Filename slug must be unique; we use phrase key for lookup
const callingPhrases = [
    { phrase: 'רגע אחד', filename: 'calling-rega-echad.mp3', lang: 'he-IL' },
    { phrase: 'שנייה בבקשה', filename: 'calling-shniya-bevakasha.mp3', lang: 'he-IL' },
    { phrase: 'אני בודק', filename: 'calling-ani-bodek.mp3', lang: 'he-IL' },
    { phrase: 'hi', filename: 'calling-hi.mp3', lang: 'en-US' },
    { phrase: 'לא הבנתי', filename: 'calling-lo-havanti.mp3', lang: 'he-IL' },
    { phrase: 'אתה יכול לחזור על זה?', filename: 'calling-ata-yachol-lachazor.mp3', lang: 'he-IL' },
    { phrase: 'כן', filename: 'calling-ken.mp3', lang: 'he-IL' },
    { phrase: 'בסדר', filename: 'calling-beseder.mp3', lang: 'he-IL' },
    { phrase: 'אוקיי', filename: 'calling-okai.mp3', lang: 'he-IL' },
    { phrase: 'כן, אני מקשיב', filename: 'calling-ken-ani-makshiv.mp3', lang: 'he-IL' },
    { phrase: 'תודה על הסבלנות', filename: 'calling-toda-al-hasavlanut.mp3', lang: 'he-IL' }
];

const apiKey = process.env.FINEVOICE_API_KEY;
const voiceModel = process.env.FINEVOICE_VOICE_MODEL || 'danny21-321536';

if (!apiKey) {
    console.error('Error: FINEVOICE_API_KEY environment variable is not set');
    console.error('Please set it with: export FINEVOICE_API_KEY=your_key_here');
    process.exit(1);
}

const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

async function generateAudio(item) {
    try {
        console.log(`Generating audio for: "${item.phrase}" -> ${item.filename}`);

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
                speech: item.phrase.trim(),
                voice: voiceModel,
                ChangerType: 3,
                designUuid: null,
                platform: `web-app-tts-${voiceModel}`,
                Parameter: {
                    speed: 1,
                    languageCode: item.lang || 'he-IL',
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
        const filePath = path.join(publicDir, item.filename);
        fs.writeFileSync(filePath, buffer);

        console.log(`✓ Saved: ${item.filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
        return true;
    } catch (error) {
        console.error(`✗ Error generating "${item.phrase}":`, error.message);
        return false;
    }
}

async function generateAll() {
    console.log('Starting calling phrases audio generation (FineVoice 2.1)...\n');
    console.log(`Voice: ${voiceModel}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const item of callingPhrases) {
        const success = await generateAudio(item);
        if (success) successCount++;
        else failCount++;
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
