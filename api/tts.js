export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Get API key from environment variable
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
    
    // Use eleven_turbo_v3_alpha model for better Hebrew support
    const trimmedText = text.trim();
    
    const requestBody = {
      text: trimmedText,
      model_id: 'eleven_turbo_v3_alpha',
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

    // Get the audio blob
    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    
    // Send the audio data
    return res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    return res.status(500).json({ error: 'Failed to generate speech: ' + error.message });
  }
}
