// ===== HYPERCORE · tailwind.config.js =====
// Tailwind (CDN JIT) theme customisation for the X-Ray cyber palette.
// This file must load BEFORE the tailwind CDN <script>, hence it lives in
// index.html as an inline block. Kept here as a source-of-truth reference —
// if you migrate to a real build (tailwind CLI / postcss), point your
// tailwind.config.js content array at this file.

window.tailwindConfig = {
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: '#000000',
                    surface: '#0a0c10',
                    border: 'rgba(0,229,255,0.20)',
                    accent: '#00e5ff',
                    accentLight: '#67e8f9',
                    gold: '#f1e05a',
                    danger: '#9f1239'
                },
                xray: {
                    base: '#0a0c10',
                    deep: '#05070a',
                    bone: '#e2e8f0',
                    skeletal: 'rgba(255, 255, 255, 0.05)',
                    accent: '#00e5ff',
                    accentDim: 'rgba(0, 229, 255, 0.4)',
                    accentGlow: 'rgba(0, 229, 255, 0.3)',
                    danger: '#ff3860',
                    warn: '#f1e05a'
                }
            },
            borderRadius: { 'custom': '12px' },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"Geist Mono"', 'monospace']
            }
        }
    }
};
