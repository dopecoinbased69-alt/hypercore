// ===== HYPERCORE · Toast.jsx =====
// Toast HUD component

const Toast = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 safe-bottom safe-x z-[200] flex justify-end pointer-events-none">
            <div className="animate-toast-in pointer-events-auto bg-[#010a0d] text-white px-5 py-4 angular-cut border border-cyan-500/40 flex items-center gap-4 relative overflow-hidden scan-effect shadow-[0_0_40px_-12px_rgba(0,229,255,0.45)] sm:max-w-md">
                <div className="w-9 h-9 bg-cyan-500/15 angular-cut-sm flex items-center justify-center text-cyan-300 shrink-0">
                    <Icon name="terminal" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-cyan-500/70 uppercase tracking-[0.3em] mono mb-0.5">NODE :: SANDBOX-HC</div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-cyan-50 glow-text truncate block">{message}</span>
                </div>
                <button onClick={onClose} className="tap-target text-cyan-500/70 hover:text-cyan-300 transition-colors flex items-center justify-center shrink-0">
                    <Icon name="slash" size={14} className="rotate-45" />
                </button>
            </div>
        </div>
    );
};

