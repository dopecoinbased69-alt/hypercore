// ===== HYPERCORE · ForgePage.jsx =====
// Forge Page — Neo-Nexus tool directory

function ForgePage({ tools, setTools, vault, setVault, pushToast, showToast, networkOnline, actionLog, setActionLog, triggerConfirmation }) {
    const [forgeTab, setForgeTab] = useState('directory');
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Assets');
    const [forgeOpen, setForgeOpen] = useState(false);
    const [forgeBusy, setForgeBusy] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

    const logAction = (label) => { setActionLog(prev => [{ t: Date.now(), label }, ...prev]); };

    const onTapTool = (tool) => {
        try { navigator.clipboard.writeText(tool.snippet); } catch (e) {}
        pushToast(tool, true);
        logAction(`Extracted snippet: ${tool.name}`);
    };

    const onLongPressTool = (tool) => {
        if (vault.find(v => v.id === tool.id)) {
            setVault(v => v.filter(x => x.id !== tool.id));
            logAction(`Unpinned tool: ${tool.name}`);
        } else {
            setVault(v => [tool, ...v]);
            logAction(`Pinned tool to vault: ${tool.name}`);
        }
    };

    const filtered = useMemo(() => {
        let list = tools;
        if (activeCategory !== 'All Assets') list = list.filter(t => t.category === activeCategory);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.toLowerCase().includes(q)));
        }
        return list;
    }, [tools, search, activeCategory]);

    const deleteTool = (tool) => {
        triggerConfirmation('Purge Tool', `Permanently remove "${tool.name}" from the directory?`, () => {
            setTools(prev => prev.filter(t => t.id !== tool.id));
            setVault(prev => prev.filter(t => t.id !== tool.id));
            logAction(`Purged tool: ${tool.name}`);
        });
    };

    const executeForge = async (cfg) => {
        setForgeBusy(true); logAction(`Forging new tool: "${cfg.idea}"`);
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController(); abortRef.current = controller;

        try {
            const sys = `You are the Hypercore X-Ray Tool Forge. Generate a single NEW AI tool listing. Output STRICT JSON: {"name":"...","description":"...","snippet":"...","tags":["..."],"power":<int 0-100>,"speed":<int 0-100>,"rating":<float 4.0-5.0>}. The snippet must be a self-contained, runnable code example. No markdown backticks inside snippet values.`;
            const userPrompt = `Create a ${cfg.category} category tool: ${cfg.idea}. Complexity: ${cfg.complexity}. Style: ${cfg.style}. ${cfg.includeComments ? 'Include comments.' : ''} ${cfg.extraInstructions}`;
            const payload = {
                contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: sys }] },
                generationConfig: { responseMimeType: 'application/json', responseSchema: { type: 'OBJECT', properties: { name: { type: 'STRING' }, description: { type: 'STRING' }, snippet: { type: 'STRING' }, tags: { type: 'ARRAY', items: { type: 'STRING' } }, power: { type: 'INTEGER' }, speed: { type: 'INTEGER' }, rating: { type: 'NUMBER' } }, required: ['name', 'description', 'snippet'] } }
            };

            const result = await callGeminiWithBackoff(payload, { retries: 3, delay: 700, signal: controller.signal, timeoutMs: 25000 });
            const parsed = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
            const meta = CAT_META[cfg.category] || CAT_META.Code;
            
            const newTool = {
                id: 'ai_' + Date.now(), serial: tools.length + 1, name: (parsed.name || 'Unnamed').slice(0, 24),
                category: cfg.category, description: parsed.description || cfg.idea, rating: (parsed.rating || (4 + Math.random())).toFixed(1),
                icon: meta.icon, color: meta.accent, snippet: parsed.snippet || `// ${parsed.name}`, tags: parsed.tags || ['ai-generated'],
                stats: { power: Math.max(0, Math.min(100, parsed.power ?? 65)), speed: Math.max(0, Math.min(100, parsed.speed ?? 70)) },
                createdAt: Date.now(), source: 'ai'
            };
            setTools(prev => [newTool, ...prev]); pushToast(newTool, false);
            logAction(`AI forged: ${newTool.name}`); setForgeOpen(false); showToast("Tool forged successfully.");
        } catch (err) {
            if (err.name !== 'AbortError') showToast('Forge failed: ' + err.message);
        } finally {
            setForgeBusy(false); abortRef.current = null;
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Forge Navigation */}
            <div className="flex gap-4 border-b border-[rgba(0,229,255,0.20)] overflow-x-auto">
                {['directory', 'vault'].map(t => (
                    <button key={t} onClick={() => setForgeTab(t)} className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${forgeTab === t ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {t} <span className="text-[9px] text-gray-600">({t === 'directory' ? tools.length : vault.length})</span>
                        {forgeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00e5ff]" />}
                    </button>
                ))}
                <button onClick={() => setForgeOpen(true)} className="pb-4 text-xs font-bold uppercase tracking-widest text-[#00e5ff] hover:text-[#67e8f9] transition-all ml-auto flex items-center gap-1">
                    <Icon name="sparkles" size={12} /> Forge New Tool
                </button>
            </div>

            {forgeTab === 'directory' && (
                <>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-10 bg-cyan-400" />
                        <span className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase">System Active</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4 uppercase leading-[0.92]">
                        Neo-Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-700 glow-text italic">Tool Forge.</span>
                    </h1>
                    <p className="text-cyan-100/40 text-sm max-w-xl mb-8 font-medium leading-relaxed uppercase tracking-wide">
                        Encrypted neural-asset directory. Tap tool to extract code. Long-press to pin to vault.
                    </p>

                    <div className="relative mb-6">
                        <Icon name="command" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="INITIALIZE SEARCH_QUERY…" className="w-full pl-11 pr-4 py-3 bg-black/40 border border-cyan-500/20 angular-cut focus:border-cyan-400 outline-none text-xs font-bold tracking-widest text-cyan-100 placeholder:text-cyan-900 transition-all" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {['All Assets', ...CATEGORY_LIST].map(c => (
                            <button key={c} onClick={() => setActiveCategory(c)} className={`tap-target px-4 py-2 angular-cut-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'bg-cyan-500 text-black glow-cyan' : 'bg-transparent text-cyan-600 border border-cyan-500/20 hover:border-cyan-400 hover:text-cyan-400'}`}>
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filtered.map(t => (
                            <div key={t.id} className="relative group">
                                <ToolCard tool={t} onTap={onTapTool} onLongPress={onLongPressTool} />
                                <button onClick={() => deleteTool(t)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-900/80 p-1.5 rounded text-red-300 hover:bg-red-600 hover:text-white transition-all z-20">
                                    <Icon name="trash" size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {forgeTab === 'vault' && (
                <div className="space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">Skeletal <span className="text-cyan-400 glow-text">Vault</span></h2>
                    {vault.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-cyan-900 angular-cut">
                            <Icon name="shield" size={48} className="mx-auto text-cyan-800 mb-4" />
                            <p className="text-cyan-700 text-xs font-bold uppercase tracking-widest">Vault empty · long-press tools to pin them here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {vault.map(t => (
                                <ToolCard key={t.id} tool={t} onTap={onTapTool} onLongPress={onLongPressTool} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AIForgeModal open={forgeOpen} busy={forgeBusy} networkOnline={networkOnline} onClose={() => { if (!forgeBusy) setForgeOpen(false); }} onGenerate={executeForge} />
        </div>
    );
}

