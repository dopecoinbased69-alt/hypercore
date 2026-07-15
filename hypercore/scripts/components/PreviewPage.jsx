// ===== HYPERCORE · PreviewPage.jsx =====
// Live preview surface — renders the current code buffer inside a sandboxed
// iframe. NOTE: this component was referenced by App.jsx in the original
// monolith but its definition was missing from the concatenated source.
// The stub below preserves the same API (`code` prop) and is fully functional.

function PreviewPage({ code }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        // Use srcdoc so the iframe is fully isolated from the parent app.
        iframe.srcdoc = code || '<!doctype html><html><body style="background:#05070a;color:#00e5ff;font-family:monospace;display:grid;place-items:center;height:100vh;">EMPTY BUFFER</body></html>';
    }, [code]);

    return (
        <div className="h-full w-full flex flex-col bg-black">
            <div className="h-10 shrink-0 px-4 flex items-center justify-between border-b border-[rgba(0,229,255,0.20)] bg-[#0a0c10]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    <Icon name="eye" size={12} />
                    Live Preview
                </div>
                <span className="text-[9px] mono text-cyan-600">SANDBOXED</span>
            </div>
            <div className="flex-1 relative">
                <iframe
                    ref={iframeRef}
                    title="hypercore-preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="absolute inset-0 w-full h-full bg-white"
                />
            </div>
        </div>
    );
}
