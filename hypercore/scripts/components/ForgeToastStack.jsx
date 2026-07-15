// ===== HYPERCORE · ForgeToastStack.jsx =====
// Forge Toast Stack — detailed tool extractor HUD

const ForgeToastStack = ({ toasts, removeToast, clearAllToasts, copySnippet, pauseToast, resumeToast }) => (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 safe-bottom safe-x z-[200] flex flex-col gap-3 sm:max-w-sm pointer-events-none">
        {toasts.length > 1 && (
            <button
                onClick={clearAllToasts}
                className="tap-target pointer-events-auto self-end px-4 py-2 bg-rose-950/30 hover:bg-rose-600 active:bg-rose-700 text-[10px] text-rose-400 hover:text-white font-bold uppercase tracking-[0.2em] angular-cut-sm border border-rose-500/30 transition-all flex items-center gap-2"
            >
                PURGE LOGS <Icon name="zapOff" size={12} />
            </button>
        )}
        {toasts.map(toast => (
            <div
                key={toast.id}
                onMouseEnter={() => pauseToast(toast.id)}
                onMouseLeave={() => resumeToast(toast.id)}
                className="animate-toast-in pointer-events-auto bg-[#010a0d] text-white p-5 angular-cut border border-cyan-500/30 flex flex-col gap-4 relative overflow-hidden scan-effect shadow-[0_0_40px_-12px_rgba(0,229,255,0.4)]"
            >
                {toast.copied && (
                    <div className="absolute inset-0 bg-cyan-600/90 z-30 flex items-center justify-center backdrop-blur-md fade-in">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name="terminal" size={36} className="text-white animate-xray" />
                            <span className="font-bold text-xs tracking-[0.3em] uppercase glow-text">DATA UPLINK SUCCESS</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${toast.color} angular-cut-sm flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]`}>
                            <Icon name={toast.icon} size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-[11px] font-black uppercase tracking-widest glow-text">{toast.name}</h4>
                                <span className="text-[8px] bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20 text-cyan-400 mono">NODE::{String(toast.id).slice(-6)}</span>
                            </div>
                            <p className="text-[9px] text-cyan-500/60 uppercase tracking-tighter font-bold mt-1">Status: Operational // Protocol 7-B</p>
                        </div>
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="tap-target text-slate-500 hover:text-cyan-400 transition-colors flex items-center justify-center">
                        <Icon name="slash" size={16} className="rotate-45" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-cyan-500/10">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] uppercase font-bold text-cyan-500/50">
                            <span>Processing</span>
                            <span className="text-cyan-400">{toast.stats.power}GHz</span>
                        </div>
                        <div className="pokedex-stat-bar">
                            <div className="pokedex-stat-fill bg-cyan-400 shadow-[0_0_10px_#00e5ff]" style={{ width: `${toast.stats.power}%` }} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] uppercase font-bold text-cyan-500/50">
                            <span>Latency</span>
                            <span className="text-cyan-400">{toast.stats.speed}ms</span>
                        </div>
                        <div className="pokedex-stat-bar">
                            <div className="pokedex-stat-fill bg-cyan-700" style={{ width: `${toast.stats.speed}%` }} />
                        </div>
                    </div>
                </div>
                <div className="relative group z-10">
                    <pre
                        onClick={() => copySnippet(toast)}
                        className="bg-black/60 p-3 text-[10px] mono text-cyan-300/80 overflow-x-auto border-l-2 border-cyan-500/50 cursor-pointer hover:bg-cyan-500/5 transition-all active:scale-[0.99] max-h-40"
                    ><code>{toast.snippet}</code></pre>
                    <button
                        onClick={() => copySnippet(toast)}
                        className={`tap-target absolute top-2 right-2 p-2 angular-cut-sm transition-all border border-cyan-500/30 flex items-center justify-center ${toast.copied ? 'bg-cyan-600 text-white' : 'bg-slate-900 hover:bg-cyan-900 text-cyan-400'}`}
                    >
                        <Icon name={toast.copied ? 'check' : 'terminal'} size={12} />
                    </button>
                </div>
            </div>                ))}
    </div>
);

