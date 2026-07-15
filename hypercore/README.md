# HYPERCORE PRO v6.9 · X-Ray Edition

A modularised refactor of the original single-file `HYPERCORE` React monolith
(≈1,650 lines). The runtime is unchanged — React 18 UMD + in-browser Babel +
Tailwind CDN — but the code is now split into cohesive layers so features can
be added or replaced without touching the rest of the app.

## Project layout

```
hypercore/
├── index.html                     ← entry point (loads modules in dep order)
├── styles/
│   └── main.css                   ← global CSS: x-ray theme, animations, angular cuts
└── scripts/
    ├── config/
    │   └── tailwind.config.js     ← Tailwind theme extension (must load before tailwind CDN)
    │
    ├── core/                      ← framework-agnostic building blocks
    │   ├── storage.js             ← versioned localStorage layer (`storage`)
    │   └── analyzer.js            ← `analyzeCode()` — code-context classifier
    │
    ├── data/                      ← static assets (pure data / templates)
    │   ├── three-template.js      ← `DEFAULT_THREE_CODE` starter buffer
    │   ├── chip-library.js        ← `STATIC_CHIP_LIBRARY`, `getStaticChips()`
    │   └── seed-tools.js          ← `SEED_TOOL_NAMES`, `CAT_META`, `buildSeedTools()`
    │
    ├── services/                  ← external I/O (side-effectful)
    │   ├── gemini.js              ← `callGeminiWithBackoff()` — text generation
    │   ├── tts.js                 ← `callGeminiTTS()` + `playPCM16()`
    │   └── imagen.js              ← `callImagenWithBackoff()`
    │
    └── components/                ← React UI layer
        ├── Icon.jsx               ← inline-SVG icon library
        ├── Toast.jsx              ← single HUD toast
        ├── ForgeToastStack.jsx    ← multi-slot forge toast HUD
        ├── RefactorBtn.jsx        ← button primitive
        ├── ToolCard.jsx           ← forge tool card
        ├── AIForgeModal.jsx       ← "generate a tool" modal
        ├── PreviewPage.jsx        ← sandboxed iframe live preview *
        ├── ModuleBuilder.jsx      ← save/reinject reusable snippets *
        ├── SettingsPage.jsx       ← engine + vault settings *
        ├── AgentSidebar.jsx       ← multi-agent chat sidebar
        ├── IDEPage.jsx            ← code editor + AI patch surface
        ├── ForgePage.jsx          ← tool directory / forge
        └── App.jsx                ← root — routing, state, layout

* PreviewPage, ModuleBuilder and SettingsPage were referenced by App.jsx in
  the original monolith but their component definitions were missing from the
  source. Functional stubs are provided so the app boots cleanly; extend
  them as your product requires.
```

## Layer contract

| Layer         | May import                          | Rule of thumb                            |
| ------------- | ----------------------------------- | ---------------------------------------- |
| `core`        | nothing (browser globals only)      | pure logic, no React, no network         |
| `data`        | nothing                             | constants / static templates             |
| `services`    | `core`                              | network calls, caching, side effects     |
| `components`  | `core`, `data`, `services`, siblings | JSX only, no direct `fetch()`            |

Loading order in `index.html` mirrors this graph — do not reorder unless
you're also updating the dependency contract.

## Running

Because in-browser Babel loads JSX via `<script src=…>`, the app **must be
served over HTTP** (not `file://` — browsers block script src loads from the
filesystem). Any of these will work:

```bash
# Python 3
python3 -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Then open http://localhost:8000/ .

## Adding a new component

1. Create `scripts/components/MyThing.jsx`.
2. Declare a top-level `function MyThing(props) { … }` (no `export` — all
   modules share the global scope).
3. Add a `<script type="text/babel" src="scripts/components/MyThing.jsx"></script>`
   line to `index.html`, placed after any siblings it depends on.
4. Reference `<MyThing />` from wherever it belongs.

## Migrating to a real build

The current setup is intentionally build-free (Babel runs in the browser).
When you outgrow it:

- Move each module to ES `export` / `import`.
- Wire up Vite or esbuild (the folder layout is already Vite-friendly).
- Point Tailwind's `content` glob at `./scripts/**/*.{js,jsx}` and drop the
  CDN script tag.
- Replace `<script src="…tailwind.config.js">` with a proper
  `tailwind.config.js` at the project root.

## Known limitations carried over from the original

- `callGemini*` helpers read `apiKey = ""` and rely on the runtime to inject
  a key — provide one before shipping.
- Everything lives on `localStorage`; there's no server sync.
- No test suite. Add one before touching `App.jsx` state logic.
