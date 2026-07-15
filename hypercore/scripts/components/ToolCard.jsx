// ===== HYPERCORE · ToolCard.jsx =====
// Tool Card

const ToolCard = ({ tool, onTap, onLongPress }) => {
    const pressTimer = useRef(null);
    const handleDown = () => { if (onLongPress) pressTimer.current = setTimeout(() => onLongPress(tool), 550); };
    const handleUp = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
    const critical = tool.stats?.power > 70;

    return (
        <div onClick={() => onTap(tool)} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp} onTouchStart={handleDown} onTouchEnd={handleUp} className="tool-card angular-cut p-6 flex flex-col h-full relative overflow-hidden cursor-pointer group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-1 h-0 group-hover:h-full bg-cyan-400 transition-all duration-500" />

            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 ${tool.color} angular-cut-sm flex items-center justify-center text-white transition-all group-hover:rotate-6`}><Icon name={tool.icon} size={22} /></div>
                <div className="text-right"><span className="text-[8px] font-black tracking-widest text-cyan-500 uppercase block mb-1">{tool.category}</span><span className="text-[10px] text-white/20 mono">#{String(tool.serial || 0).padStart(4, '0')}</span></div>
            </div>

            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight group-hover:text-cyan-400 transition-colors italic line-clamp-2">{tool.name}</h3>
            <p className="text-cyan-100/40 text-[11px] leading-relaxed mb-6 flex-grow tracking-wide font-medium line-clamp-3">{tool.description}</p>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[8px] font-black uppercase text-cyan-700"><span className="tracking-widest">Load Complexity</span><span className={critical ? 'text-rose-400' : 'text-cyan-500'}>{critical ? 'CRITICAL' : 'STABLE'}</span></div>
                <div className="flex gap-1 h-1">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className={`flex-1 angular-cut-sm ${i < Math.round((tool.stats?.power || 50) / 12) ? 'bg-cyan-500 shadow-[0_0_5px_#00e5ff]' : 'bg-cyan-950'}`} />))}</div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" /><span className="text-[10px] font-black text-cyan-400">{tool.rating} RANK</span></div>
                <div className="flex items-center gap-1 text-white font-black text-[9px] uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-all">EXTRACT <Icon name="chevronRight" size={11} /></div>
            </div>
            {tool.source === 'ai' && <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 angular-cut-sm"><span className="text-[8px] font-black uppercase text-cyan-400 flex items-center gap-1"><Icon name="sparkles" size={9} /> AI</span></div>}
        </div>
    );
};

