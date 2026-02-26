export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, version = '2.0' } = req.body;

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (version !== '1.0' && version !== '2.0') {
    return res.status(400).json({ error: 'Version must be "1.0" or "2.0"' });
  }

  const trimmedText = text.trim();

  if (version === '1.0') {
    return handleElevenLabs(req, res, trimmedText);
  }

  return handleResemble(req, res, trimmedText);
}

async function handleElevenLabs(req, res, text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' });
  }

  const voiceId = 'wFzdaipEHKrAyjK9EKuv';

  try {
    // First, get voice settings to match web interface defaults
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

    const requestBody = {
      text,
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
      return res.status(response.status).json({
        error: errorData.detail?.message || `ElevenLabs API error: ${response.statusText}`
      });
    }

    const audioBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);

    return res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    return res.status(500).json({ error: 'Failed to generate speech: ' + error.message });
  }
}

async function handleResemble(req, res, text) {
  const apiKey = process.env.RESEMBLE_API_KEY;
  const voiceUuid = process.env.RESEMBLE_VOICE_UUID;

  if (!apiKey) {
    return res.status(500).json({ error: 'Resemble API key not configured' });
  }

  if (!voiceUuid) {
    return res.status(500).json({ error: 'Resemble voice UUID not configured' });
  }

  try {
    const url = 'https://f.cluster.resemble.ai/synthesize';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voice_uuid: voiceUuid,
        data: text,
        output_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || errorData.detail || `Resemble API error: ${response.statusText}`;
      return res.status(response.status).json({ error: message });
    }

    const json = await response.json();

    if (!json.success || !json.audio_content) {
      return res.status(500).json({ error: 'Invalid response from Resemble API' });
    }

    const audioBuffer = Buffer.from(json.audio_content, 'base64');

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);

    return res.send(audioBuffer);
  } catch (error) {
    console.error('Error calling Resemble API:', error);
    return res.status(500).json({ error: 'Failed to generate speech: ' + error.message });
  }
}
