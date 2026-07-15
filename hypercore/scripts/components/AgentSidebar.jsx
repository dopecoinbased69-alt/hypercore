// ===== HYPERCORE · AgentSidebar.jsx =====
// Multi-Agent Sidebar

function AgentSidebar({ isOpen, onClose, code, applyAICode, showToast, settings, codeAnalysis, conversations, appendConversation, clearConversation, actionLog, selectedVoice }) {
    const [selectedAgent, setSelectedAgent] = useState('code');
    const [prompt, setPrompt] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [agentResponse, setAgentResponse] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [imageRef, setImageRef] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const fileInputRef = useRef(null);

    const agents = {
        code: { name: 'Code Agent', icon: 'code', color: '#00e5ff', desc: 'Full-stack software construction', systemPrompt: 'You are the Hypercore Code Agent. Return the exact code block in ```html...```.' },
        debug: { name: 'Debug Agent', icon: 'bug', color: '#9f1239', desc: 'Error isolation & fix logic', systemPrompt: 'You are the Hypercore Debug Agent. Output a corrected full source block in ```html...```.' },
        design: { name: 'Design Agent', icon: 'pen', color: '#f1e05a', desc: 'UI/UX & aesthetic polish', systemPrompt: 'You are the Hypercore Design Agent. Output modernized code block inside ```html...```.' },
        architect: { name: 'Architect Agent', icon: 'box', color: '#67e8f9', desc: 'Scalable structural patterns', systemPrompt: 'You are the Hypercore Architect Agent. Output detailed architectural explanations.' }
    };

    const currentHistory = conversations[selectedAgent] || [];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onload = (f) => setImageRef(f.target.result); reader.readAsDataURL(file); }
    };

    const handleProcess = async (manualPrompt) => {
        const query = manualPrompt || prompt;
        if (!query && !manualPrompt) return;
        setIsBusy(true); setAgentResponse(''); setGeneratedCode(''); showToast(`Contacting ${agents[selectedAgent].name}...`);

        try {
            const ctx = `Type: ${codeAnalysis.type} | Lines: ${codeAnalysis.lines} | Libs: [${codeAnalysis.libraries.join(', ')}]`;
            const recent = settings.conversationMemory && currentHistory.length > 0 ? currentHistory.slice(-4).map(t => `[${t.role.toUpperCase()}]: ${t.content.slice(0, 400)}`).join('\n') : '';
            const combinedPrompt = `[CONTEXT]\n${ctx}\n[HISTORY]\n${recent}\n[CODE]\n\`\`\`html\n${code}\n\`\`\`\n[INSTRUCTION]\n${query}`;
            
            const parts = [{ text: combinedPrompt }];
            if (imageRef) parts.push({ inlineData: { mimeType: "image/png", data: imageRef.split(',')[1] } });
            
            const payload = { contents: [{ parts: parts }], systemInstruction: { parts: [{ text: agents[selectedAgent].systemPrompt }] } };
            if (settings.grounding) payload.tools = [{ "google_search": {} }];

            const result = await callGeminiWithBackoff(payload);
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No output returned.";
            setAgentResponse(text);

            const codeBlockMatch = text.match(/```html\s*([\s\S]*?)\s*```/i);
            let extractedCode = null;
            if (codeBlockMatch && codeBlockMatch[1]) { extractedCode = codeBlockMatch[1]; setGeneratedCode(extractedCode); }

            appendConversation(selectedAgent, { role: 'user', content: query, ts: Date.now() });
            appendConversation(selectedAgent, { role: 'assistant', content: text.slice(0, 2000), hasCode: !!extractedCode, ts: Date.now() });
            showToast(`${agents[selectedAgent].name} complete.`);
        } catch (error) { showToast(error.message); } finally { setIsBusy(false); setPrompt(''); setImageRef(null); }
    };

    const runRefactor = (type) => {
        const map = {
            structural: "Please restructure and clean up this layout.",
            performance: "Please optimize code execution.",
            normalization: "Please normalize formatting.",
            security: "Please sanitize scripting modules."
        };
        handleProcess(map[type]);
    };

    return (
        <div className={`agent-sidebar fixed lg:relative right-0 top-0 h-full w-[450px] max-w-full bg-[#0a0c10] border-l border-[rgba(0,229,255,0.20)] z-[100] flex flex-col glass-xray shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>
            <div className="p-4 border-b border-[rgba(0,229,255,0.20)] flex items-center justify-between font-sans">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00e5ff]">Intelligence Hub</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHistory(!showHistory)} className={`p-1 rounded transition-all ${showHistory ? 'text-[#67e8f9] bg-[#00e5ff]/20' : 'text-gray-500 hover:text-white'}`}><Icon name="message" size={16} /></button>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><Icon name="x" size={20} /></button>
                </div>
            </div>

            <div className="p-4 grid grid-cols-4 gap-2 border-b border-[rgba(0,229,255,0.20)] shrink-0 font-sans">
                {Object.entries(agents).map(([key, val]) => (
                    <button key={key} onClick={() => setSelectedAgent(key)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all relative ${selectedAgent === key ? 'border-[#00e5ff] bg-[#00e5ff]/10' : 'border-[rgba(0,229,255,0.20)] bg-black hover:border-gray-600'}`}>
                        <Icon name={val.icon} size={20} className={selectedAgent === key ? 'text-[#67e8f9]' : 'text-gray-500'} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-center leading-none">{val.name.split(' ')[0]}</span>
                        {conversations[key]?.length > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    </button>
                ))}
            </div>

            <div className="px-4 py-2 bg-black/40 border-b border-[rgba(0,229,255,0.20)]/40 text-[9px] text-gray-500 flex items-center gap-2 shrink-0 mono">
                <Icon name="cpu" size={10} className="text-[#67e8f9] shrink-0" />
                <span className="truncate">{codeAnalysis.summary}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans">
                <div className="bg-[#0b0c10]/50 border border-[rgba(0,229,255,0.20)]/40 rounded-xl p-3 text-xs">
                    <h4 className="text-[#67e8f9] font-bold text-[10px] uppercase tracking-wider mb-1">{agents[selectedAgent].name}</h4>
                    <p className="text-gray-400 text-[11px]">{agents[selectedAgent].desc}</p>
                </div>

                {showHistory && (
                    <div className="bg-black border border-[rgba(0,229,255,0.20)] rounded-xl p-3 space-y-2 max-h-[260px] overflow-y-auto fade-in">
                        <div className="flex justify-between items-center pb-2 border-b border-[rgba(0,229,255,0.20)]">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1"><Icon name="clock" size={10} /> Memory ({currentHistory.length} turns)</span>
                            {currentHistory.length > 0 && <button onClick={() => clearConversation(selectedAgent)} className="text-[9px] text-red-500 hover:text-red-300">Clear</button>}
                        </div>
                        {currentHistory.length === 0 ? <p className="text-[10px] text-gray-600 italic">No prior turns.</p> : currentHistory.slice(-10).map((t, i) => (
                            <div key={i} className={`p-2 rounded text-[10px] ${t.role === 'user' ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-blue-200' : 'bg-gray-900/40 border border-gray-800 text-gray-300'}`}>
                                <div className="font-bold uppercase text-[8px] mb-0.5 opacity-70">{t.role}</div>
                                <div className="whitespace-pre-wrap leading-snug">{t.content.length > 280 ? t.content.slice(0, 280) + '…' : t.content}</div>
                            </div>
                        ))}
                    </div>
                )}

                {agentResponse && (
                    <div className="bg-black border border-[rgba(0,229,255,0.20)] rounded-xl p-4 space-y-4 max-h-[300px] overflow-y-auto fade-in">
                        <div className="flex justify-between items-center pb-2 border-b border-[rgba(0,229,255,0.20)]">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Core Response Stream</span>
                            <button onClick={() => setAgentResponse('')} className="text-gray-600 hover:text-white"><Icon name="x" size={12} /></button>
                        </div>
                        <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{agentResponse}</p>
                        {generatedCode && <button onClick={() => { applyAICode(generatedCode, `${agents[selectedAgent].name}: applied generated code`); setGeneratedCode(''); showToast('IDE code buffer updated!'); }} className="w-full h-9 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-2"><Icon name="check" size={14} /> Commit Changes to Workspace</button>}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Instructions</label>
                    <div className="relative">
                        <textarea className="w-full h-24 bg-black border border-[rgba(0,229,255,0.20)] rounded-xl p-4 text-xs focus:outline-none focus:border-[#00e5ff] text-white resize-none" placeholder={`Command the ${agents[selectedAgent].name}...`} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isBusy} />
                        {imageRef && (
                            <div className="absolute bottom-3 left-3 w-12 h-12 rounded border border-[#00e5ff] overflow-hidden group">
                                <img src={imageRef} className="w-full h-full object-cover" />
                                <button onClick={() => setImageRef(null)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="trash" size={12} className="text-white" /></button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="h-11 px-4 bg-black border border-[rgba(0,229,255,0.20)] rounded-xl hover:border-gray-500 text-gray-400 transition-all flex items-center justify-center"><Icon name="image" size={18} /><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></button>
                    <button onClick={() => handleProcess()} disabled={isBusy || (!prompt && !imageRef)} className="flex-1 h-11 bg-[#0891b2] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#00e5ff] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2">{isBusy ? <Icon name="loader" size={16} /> : <><Icon name="sparkles" size={14} /> Process Core</>}</button>
                </div>

                <div className="space-y-3 pt-4 border-t border-[rgba(0,229,255,0.20)]">
                    <h4 className="text-[10px] font-black uppercase text-[#67e8f9] tracking-widest flex items-center gap-2"><Icon name="zap" size={12} /> Auto-Refactor Engine</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <RefactorBtn label="Restructure" icon="layers" onClick={() => runRefactor('structural')} />
                        <RefactorBtn label="Optimize" icon="cpu" onClick={() => runRefactor('performance')} />
                        <RefactorBtn label="Clean Code" icon="sparkles" onClick={() => runRefactor('normalization')} />
                        <RefactorBtn label="Sanitize" icon="shield" onClick={() => runRefactor('security')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

