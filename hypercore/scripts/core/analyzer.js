// ===== HYPERCORE · analyzer.js =====
// Code Context Analyzer

const analyzeCode = (code) => {
    if (!code || typeof code !== 'string') return { isEmpty: true, length: 0, lines: 0, type: 'unknown', libraries: [], features: [], colorPalette: [], summary: 'Empty buffer' };
    const lower = code.toLowerCase();
    const lines = code.split('\n').length;
    const libraries = [];
    const features = [];

    if (lower.includes('three.min.js') || /\bthree\./i.test(code)) libraries.push('Three.js');
    if (lower.includes('cdn.tailwindcss.com') || /class="[^"]*\b(flex|grid|bg-|text-)/i.test(code)) libraries.push('Tailwind CSS');
    if (lower.includes('react.production')) libraries.push('React');
    if (lower.includes('d3.min.js')) libraries.push('D3.js');
    if (lower.includes('gsap')) libraries.push('GSAP');

    if (lower.includes('<canvas')) features.push('canvas');
    if (lower.includes('webgl')) features.push('webgl');
    if (lower.includes('@keyframes')) features.push('animations');
    if (lower.includes('backdrop-filter')) features.push('glassmorphism');
    if (lower.includes('fetch(')) features.push('network');

    const colorMatches = code.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const colorPalette = [...new Set(colorMatches.map(c => c.toLowerCase()))].slice(0, 8);

    let type = 'html-page';
    if (libraries.includes('Three.js')) type = 'webgl-scene';
    else if (libraries.includes('React')) type = 'react-app';
    else if (features.includes('canvas')) type = 'canvas-graphic';

    const summary = `${type} • ${lines} lines • libs:[${libraries.join(',') || 'none'}]`;
    return { isEmpty: false, length: code.length, lines, type, libraries, features, colorPalette, summary };
};

