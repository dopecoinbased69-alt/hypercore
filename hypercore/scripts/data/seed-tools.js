// ===== HYPERCORE · seed-tools.js =====
// Forge seed data

const SEED_TOOL_NAMES = [
    "Synthetix", "PixelGen", "DevGhost", "Cinemax AI", "SoundScape", "GrowthBot", "InsightFlow", "LayerMind",
    "QuillHero", "CanvasPro", "ScriptEngine", "FrameMaster", "BeatMaker", "MarketWise", "QueryGenius", "SchemaAI"
];
const CATEGORY_LIST = ['Writing', 'Design', 'Code', 'Video', 'Audio', 'Marketing', 'Data'];
const CAT_META = {
    Writing:   { icon: 'pencil',     accent: 'bg-cyan-600' },
    Design:    { icon: 'image',      accent: 'bg-blue-600' },
    Code:      { icon: 'code',       accent: 'bg-indigo-600' },
    Video:     { icon: 'video',      accent: 'bg-violet-600' },
    Audio:     { icon: 'music',      accent: 'bg-emerald-600' },
    Marketing: { icon: 'trendingUp', accent: 'bg-rose-600' },
    Data:      { icon: 'database',   accent: 'bg-amber-600' }
};

const buildSnippet = (name, cat) => {
    const lib = name.toLowerCase().replace(/\s+/g, '');
    switch (cat) {
        case 'Code':    return `import { ${name.replace(/\s+/g,'')} } from '@nexus/dev';\n\nconst agent = new ${name.replace(/\s+/g,'')}({\n  optimize: true,\n  mode: 'autonomous'\n});\n\nawait agent.refactor('./src');`;
        case 'Writing': return `const ${lib} = require('${lib}-sdk');\n\nconst draft = await ${lib}.generate({\n  prompt: 'Future of AI',\n  tone: 'professional'\n});`;
        case 'Design':  return `import ${name.replace(/\s+/g,'')} from '${lib}-ui';\n\nconst asset = ${name.replace(/\s+/g,'')}.create({\n  prompt: 'Cyberpunk landscape',\n  style: 'photorealistic'\n});`;
        case 'Data':    return `fetch('https://api.${lib}.ai/v1/query', {\n  method: 'POST',\n  body: JSON.stringify({ q: 'analyze_growth' })\n}).then(r => r.json());`;
        default:        return `// Initialize ${name}\nconst sdk = ${name.replace(/\s+/g,'')}.init({\n  apiKey: process.env.API_KEY,\n  environment: 'production'\n});\n\nsdk.run();`;
    }
};

const buildSeedTools = () => SEED_TOOL_NAMES.map((n, i) => {
    const category = CATEGORY_LIST[i % CATEGORY_LIST.length];
    return {
        id: 'seed_' + (i + 1),
        serial: i + 1,
        name: n,
        category,
        description: `Revolutionize your core logic with ${n}. Neural algorithms tuned for high-latency environments.`,
        rating: (4 + Math.random()).toFixed(1),
        icon: CAT_META[category].icon,
        color: CAT_META[category].accent,
        snippet: buildSnippet(n, category),
        tags: ['seed', category.toLowerCase()],
        stats: { power: Math.floor(Math.random() * 60) + 40, speed: Math.floor(Math.random() * 70) + 30 },
        createdAt: Date.now() - (50 - i) * 60000,
        source: 'seed'
    };
});

