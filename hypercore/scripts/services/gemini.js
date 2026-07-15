// ===== HYPERCORE · gemini.js =====
// Gemini text-generation with retry/backoff/cache

const mergeSignals = (a, b) => {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') return AbortSignal.any([a, b]);
    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    if (a.aborted || b.aborted) ctrl.abort();
    else { a.addEventListener('abort', onAbort); b.addEventListener('abort', onAbort); }
    return ctrl.signal;
};

// ===== EXPLICIT GEMINI HELPER CALL WITH RETRIES, BACKOFF & CACHE =====
const callGeminiWithBackoff = async (payload, opts = {}) => {
    const {
        retries = 5,
        delay = 800,
        signal = null,
        timeoutMs = 25000,
        cacheKey = null
    } = opts;

    if (cacheKey) {
        const cached = aiCache.get(cacheKey);
        if (cached) return cached;
    }

    const apiKey = ""; // Populated at runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    let currentDelay = delay;
    let lastErr = null;

    for (let i = 0; i < retries; i++) {
        if (signal && signal.aborted) throw new Error('Request aborted by user.');

        const attemptController = new AbortController();
        const timer = setTimeout(() => attemptController.abort(), timeoutMs);
        const merged = signal ? mergeSignals(signal, attemptController.signal) : attemptController.signal;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: merged
            });
            clearTimeout(timer);

            if (response.ok) {
                const json = await response.json();
                if (cacheKey) aiCache.set(cacheKey, json);
                return json;
            }
            if (response.status === 400 || response.status === 403) throw new Error(`Core rejected payload (${response.status}).`);
            lastErr = new Error(`Core returned ${response.status}`);
        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError' && signal && signal.aborted) throw err;
            lastErr = err;
        }
        const jitter = Math.random() * 300;
        await new Promise(resolve => setTimeout(resolve, currentDelay + jitter));
        currentDelay = Math.min(currentDelay * 2, 8000);
    }
    throw lastErr || new Error("Unable to contact Core Intelligence after retries.");
};

