// ===== HYPERCORE · chip-library.js =====
// Static chip library for AI refactor suggestions

const STATIC_CHIP_LIBRARY = {
    'webgl-scene': [
        { id: 's1', label: '🌌 Add Orbital Camera Controls', prompt: 'Integrate smooth OrbitControls allowing the user to rotate and zoom the 3D scene with the mouse and touch.' },
        { id: 's2', label: '✨ Procedural Shader Material', prompt: 'Replace the current material with a custom GLSL fragment shader producing animated holographic gradients.' },
        { id: 's3', label: '💫 Particle Field Backdrop', prompt: 'Add a starfield of 5000 GPU-instanced points drifting behind the main object.' }
    ],
    'react-app': [
        { id: 's1', label: '🧩 Component Decomposition', prompt: 'Refactor the largest inline JSX block into smaller named components with clear prop contracts.' },
        { id: 's3', label: '🎨 Polished Theme Layer', prompt: 'Introduce a coherent design system with Tailwind utility classes for spacing, colors and typography.' }
    ],
    'html-page': [
        { id: 's1', label: '✨ Inject Neon Accents', prompt: 'Inject highly polished glowing neon details, glowing box-shadows, and elegant color schemes.' },
        { id: 's2', label: '🌌 Spawn Canvas Particles', prompt: 'Add a gorgeous HTML5 interactive particle network floating in the background.' },
        { id: 's4', label: '📱 Auto-Responsive Polish', prompt: 'Structure fluid components, padding matrices, and touch-ready targets optimized for all layouts.' }
    ]
};

const getStaticChips = (analysis) => STATIC_CHIP_LIBRARY[analysis.type] || STATIC_CHIP_LIBRARY['html-page'];

