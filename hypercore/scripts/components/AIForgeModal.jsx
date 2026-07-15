// ===== HYPERCORE · AIForgeModal.jsx =====
// AI Forge Modal

const AIForgeModal = ({ open, busy, onClose, onGenerate, networkOnline }) => {
    const [idea, setIdea] = useState('');
    const [complexity, setComplexity] = useState('Standard');
    const [category, setCategory] = useState('Code');
    const [style, setStyle] = useState('Cyberpunk / Dark');
    const [extraInstructions, setExtraInstructions] = useState('');
    const [includeComments, setIncludeComments] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!busy) { setProgress(0); return; }
        let p = 0; const id = setInterval(() => { p = Math.min(95, p + Math.random() * 12); setProgress(p); }, 350);
        return () => clearInterval(id);
    }, [busy]);

    if (!open) return null;

    const submit = () => {
        if (!idea.trim() || busy || !networkOnline) return;
        onGenerate({ idea: idea.trim(), complexity, category, style, extraInstructions: extraInstructions.trim(), includeComments });
    };

    return (
        <div className="fixed inset-0 modal-backdrop z-[150] flex items-end sm:items-center justify-center sm:p-4 fade-in safe-x">
            <div className="glass-xray border border-cyan-500/40 rounded-t-custom sm:rounded-custom w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl glow-cyan relative">
                <div className="scan-line" />
                <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between sticky top-0 glass-xray z-10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-cyan-50 flex items-center gap-2 glow-text"><Icon name="sparkles" size={16} className="text-cyan-400" /> Gemini Prompt Engine</h3>
                    <button onClick={onClose} disabled={busy} className="tap-target text-gray-500 hover:text-white disabled:opacity-30 flex items-center justify-center"><Icon name="x" size={20} /></button>
                </div>

                {!networkOnline && <div className="mx-4 mt-4 p-3 bg-rose-950/30 text-rose-300 text-[10px] uppercase font-bold flex items-center gap-2"><Icon name="wifiOff" size={12} /> Network offline</div>}

                <div className="p-4 sm:p-6 space-y-5">
                    <div><label className="text-[10px] font-bold text-cyan-500/70 uppercase block mb-2">Describe Your Tool</label><textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. A tool that..." className="w-full h-24 bg-black/60 border border-cyan-500/20 focus:border-cyan-400 angular-cut-sm px-3 py-2 text-sm text-white outline-none resize-y mono" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><label className="text-[10px] font-bold text-cyan-500/70 uppercase block mb-2">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/60 border border-cyan-500/20 angular-cut-sm px-3 py-2.5 text-sm text-white outline-none">{CATEGORY_LIST.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label className="text-[10px] font-bold text-cyan-500/70 uppercase block mb-2">Complexity</label><select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full bg-black/60 border border-cyan-500/20 angular-cut-sm px-3 py-2.5 text-sm text-white outline-none"><option>Minimal</option><option>Standard</option><option>Advanced</option></select></div>
                        <div><label className="text-[10px] font-bold text-cyan-500/70 uppercase block mb-2">Style</label><select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-black/60 border border-cyan-500/20 angular-cut-sm px-3 py-2.5 text-sm text-white outline-none"><option>Cyberpunk / Dark</option><option>Minimal</option></select></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-cyan-500/70 uppercase block mb-2">Extra Instructions</label><textarea value={extraInstructions} onChange={(e) => setExtraInstructions(e.target.value)} className="w-full h-16 bg-black/60 border border-cyan-500/20 angular-cut-sm px-3 py-2 text-xs text-white outline-none resize-y mono" /></div>
                    
                    {busy && (
                        <div className="pt-2">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-cyan-500/70 mb-2"><span className="flex items-center gap-2"><Icon name="loader" size={11} /> Synthesizing via Gemini</span><span className="text-cyan-300">{Math.round(progress)}%</span></div>
                            <div className="h-1 bg-cyan-950 angular-cut-sm overflow-hidden"><div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: progress + '%' }} /></div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 border-t border-cyan-500/20 flex justify-between sticky bottom-0 glass-xray z-10 safe-bottom">
                    <div className="text-[9px] text-cyan-700 uppercase tracking-widest hidden sm:flex items-center gap-2"><Icon name="zap" size={11} className="text-cyan-400" /> Cached</div>
                    <div className="flex items-center gap-3 ml-auto">
                        <button onClick={onClose} disabled={busy} className="tap-target text-[10px] font-bold text-gray-400 hover:text-white px-4 py-2 disabled:opacity-40 uppercase">Cancel</button>
                        <button onClick={submit} disabled={busy || !idea.trim() || !networkOnline} className="tap-target bg-cyan-500 text-black px-5 py-2.5 angular-cut-sm text-[10px] font-black uppercase flex items-center gap-2 glow-cyan disabled:opacity-40">{busy ? <><Icon name="loader" size={12} /> Forging…</> : <><Icon name="sparkles" size={12} /> Forge Tool</>}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

