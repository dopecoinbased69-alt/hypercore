// ===== HYPERCORE · tts.js =====
// Gemini TTS + PCM16 -> WAV playback

const callGeminiTTS = async (text, voiceName = "Kore", retries = 3, delay = 1000) => {
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
        }
    };

    let currentDelay = delay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (response.ok) {
                const result = await response.json();
                const base64Data = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
                if (base64Data) return base64Data;                  }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
    }
    throw new Error("TTS generation failed or timed out.");
};

const playPCM16 = (base64Data, sampleRate = 24000) => {
    try {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        
        view.setUint32(0, 0x52494646, false);
        view.setUint32(4, 36 + bytes.length, true);
        view.setUint32(8, 0x57415645, false);
        view.setUint32(12, 0x666d7420, false);
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        view.setUint32(36, 0x64617461, false);
        view.setUint32(40, bytes.length, true);

        const wavBytes = new Uint8Array(44 + bytes.length);
        wavBytes.set(new Uint8Array(header), 0);
        wavBytes.set(bytes, 44);

        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        return audio;
    } catch (err) {
        console.error("Audio playback error:", err);
        return null;
    }
};

