// ===== HYPERCORE · storage.js =====
// Persistent storage layer & AI cache (localStorage backed)

const STORAGE_KEY = 'hypercore_state_v5';
const STORAGE_VERSION = 5;
const AI_CACHE_KEY = 'hypercore_ai_cache_v5';

const storage = {
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.__version !== STORAGE_VERSION) return null;
            return data;
        } catch (err) { return null; }
    },
    save(state) {
        try {
            const payload = { ...state, __version: STORAGE_VERSION, __savedAt: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            return true;
        } catch (err) { return false; }
    },
    clear() {
        try { localStorage.removeItem(STORAGE_KEY); return true; } catch (err) { return false; }
    },
    exportAll() {
        return localStorage.getItem(STORAGE_KEY) || JSON.stringify({ __version: STORAGE_VERSION });
    }
};

// Offline-friendly AI response cache (Neo-Nexus addition)
const aiCache = {
    _read() { try { return JSON.parse(localStorage.getItem(AI_CACHE_KEY) || '{}'); } catch (e) { return {}; } },
    _write(data) { try { localStorage.setItem(AI_CACHE_KEY, JSON.stringify(data)); } catch (e) {} },
    get(key) {                const all = this._read();
        const entry = all[key];
        if (!entry) return null;
        if (Date.now() - entry.t > 7 * 24 * 3600 * 1000) {
            delete all[key]; this._write(all); return null;
        }
        return entry.v;
    },
    set(key, value) {
        const all = this._read();
        all[key] = { t: Date.now(), v: value };
        const keys = Object.keys(all);
        if (keys.length > 50) keys.sort((a, b) => all[a].t - all[b].t).slice(0, keys.length - 50).forEach(k => delete all[k]);
        this._write(all);
    }
};

