// ===== HYPERCORE · ModuleBuilder.jsx =====
// Modular reusable-snippet builder. Referenced by App.jsx in the original
// monolith but its definition was missing from the source. This stub
// implements the documented prop API (modules, setModules, showToast,
// applyAICode, setActiveTab, code, triggerConfirmation) with a minimal but
// working UI so the app boots cleanly. Extend as needed.

function ModuleBuilder({ modules, setModules, showToast, applyAICode, setActiveTab, code, triggerConfirmation }) {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');

    const saveCurrentAsModule = () => {
        const trimmed = name.trim();
        if (!trimmed) { showToast('Give the module a name first'); return; }
        const mod = { id: Date.now(), name: trimmed, note: note.trim(), code, savedAt: Date.now() };
        setModules(prev => [mod, ...prev].slice(0, 100));
        setName(''); setNote('');
        showToast(`Module "${trimmed}" saved`);
    };

    const inject = (mod) => {
        applyAICode(mod.code, `📦 Injected module: ${mod.name}`);
        setActiveTab('ide');
    };

    const remove = (mod) => {
        triggerConfirmation(
            'Delete module',
            `Permanently remove "${mod.name}" from your vault?`,
            () => {
                setModules(prev => prev.filter(m => m.id !== mod.id));
                showToast('Module removed');
            }
        );
    };

    return (
        <div className="h-full w-full flex flex-col p-6 gap-6 overflow-auto">
            <header className="shrink-0">
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-cyan-100 glow-text">Module Builder</h2>
                <p className="text-xs text-cyan-500/60 mt-1">Save reusable code snippets and re-inject them into any project buffer.</p>
            </header>

            <section className="glass-xray skeletal-border angular-cut p-5 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Save current buffer</div>
                <input
                    className="w-full bg-black/50 border border-[rgba(0,229,255,0.20)] rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400"
                    placeholder="Module name (e.g. hero-header)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <textarea
                    className="w-full bg-black/50 border border-[rgba(0,229,255,0.20)] rounded px-3 py-2 text-xs text-cyan-100 focus:outline-none focus:border-cyan-400 mono resize-none"
                    rows={2}
                    placeholder="Optional note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <button
                    onClick={saveCurrentAsModule}
                    className="tap-target bg-cyan-600 hover:bg-cyan-500 text-black font-black px-4 py-2 angular-cut-sm text-[11px] uppercase tracking-widest"
                >Save Module</button>
            </section>

            <section className="flex-1 min-h-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">
                    Saved modules · {modules.length}
                </div>
                {modules.length === 0 ? (
                    <div className="text-xs text-cyan-600/50 italic">No modules yet — save your first snippet above.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {modules.map(mod => (
                            <div key={mod.id} className="glass-xray skeletal-border angular-cut-sm p-4 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm font-bold text-cyan-100 truncate">{mod.name}</div>
                                    <div className="text-[9px] mono text-cyan-600 shrink-0">#{String(mod.id).slice(-4)}</div>
                                </div>
                                {mod.note && <div className="text-[11px] text-cyan-400/60">{mod.note}</div>}
                                <div className="flex gap-2 mt-auto pt-2">
                                    <button onClick={() => inject(mod)} className="flex-1 tap-target bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest py-2 angular-cut-sm">Inject</button>
                                    <button onClick={() => remove(mod)} className="tap-target bg-rose-800 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 angular-cut-sm">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
