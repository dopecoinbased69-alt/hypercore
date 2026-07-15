// ===== HYPERCORE · imagen.js =====
// Imagen image-generation with retry/backoff

const callImagenWithBackoff = async (prompt, retries = 5, delay = 1000) => {
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const payload = { instances: { prompt: prompt }, parameters: { sampleCount: 1 } };
    let currentDelay = delay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (response.ok) {
                const result = await response.json();
                const base64Bytes = result.predictions?.[0]?.bytesBase64Encoded;
                if (base64Bytes) return `data:image/png;base64,${base64Bytes}`;
            }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
    }
    throw new Error("Unable to contact Imagen Core generation pipeline.");
};

const generateContextualChips = async (code, analysis, recentActions) => {
    const systemPrompt = `You are the Hypercore Suggestion Engine. Propose exactly 5 short, actionable improvements specific to this code. Output STRICT JSON only. Schema: {"chips":[{"id":"c1","label":"<emoji + 2-5 words>","prompt":"<precise instruction>"}, ...5 items]}`;
    const userMsg = `[CODE ANALYSIS] Type: ${analysis.type} | Lines: ${analysis.lines} | Libs: ${analysis.libraries.join(',')} | Feats: ${analysis.features.join(',')}\n[RECENT ACTIONS] ${recentActions.slice(0, 5).join('\n')}\n[CODE] \`\`\`\n${code.slice(0, 4000)}\n\`\`\``;
    const payload = {
        contents: [{ parts: [{ text: userMsg }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { chips: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, label: { type: "STRING" }, prompt: { type: "STRING" } }, required: ["id", "label", "prompt"] } } }, required: ["chips"] } }
    };
    try {
        const result = await callGeminiWithBackoff(payload, { retries: 3, delay: 800 });
        const parsed = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        if (parsed?.chips?.length > 0) return parsed.chips.slice(0, 5).map((c, i) => ({ ...c, id: c.id || `dyn_${i}`, dynamic: true }));
        throw new Error('Empty chips');
    } catch (err) {
        return getStaticChips(analysis).map(c => ({ ...c, dynamic: false }));
    }
};


