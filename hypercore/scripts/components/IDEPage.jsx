// ===== HYPERCORE · IDEPage.jsx =====
// IDE Page — code editor + AI patch surface

function IDEPage({ code, setCode, applyAICode, showToast, settings, triggerUndo, hasHistory, dynamicChips, chipsLoading, codeAnalysis, forceSave, actionLog, currentProject, onActionLog, playBriefing, audioLoading, activeAudio }) {
    const fileInputRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [customIdea, setCustomIdea] = useState("");

    const [showSynthModal, setShowSynthModal] = useState(false);
    const [synthPrompt, setSynthPrompt] = useState("");
    const [synthImage, setSynthImage] = useState(null);
    const [synthLoading, setSynthLoading] = useState(false);

    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditData, setAuditData] = useState(null);

    const runGeminiChip = async (chipPrompt, chipLabel) => {
        if (isGenerating) return;
        setIsGenerating(true); showToast("Synthesizing suggestion...");
        try {
            const systemPrompt = "You are the Hypercore suggestion chip system. Return only the updated full HTML in ```html...```.";
            const ctx = `[CODE CONTEXT]\nType: ${codeAnalysis.type} | Lines: ${codeAnalysis.lines} | Libs: ${codeAnalysis.libraries.join(',')} | Feats: ${codeAnalysis.features.join(',')}`;
            const payload = { contents: [{ parts: [{ text: `${ctx}\n[CURRENT CODE]:\n\`\`\`html\n${code}\n\`\`\`\n[COMMAND]:\n${chipPrompt}\nExecute optimization and return new complete HTML payload.` }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
            
            const result = await callGeminiWithBackoff(payload);
            const codeBlockMatch = result.candidates?.[0]?.content?.parts?.[0]?.text?.match(/```html\s*([\s\S]*?)\s*```/i);
            if (codeBlockMatch && codeBlockMatch[1]) {
                applyAICode(codeBlockMatch[1], `Chip: ${chipLabel || chipPrompt.slice(0, 60)}`);
                showToast("Transformation compiled and applied.");
            } else { showToast("Failed to parse output."); }
        } catch (err) { showToast(err.message); } finally { setIsGenerating(false); }
    };

    const handleSynthAsset = async () => {
        if (!synthPrompt.trim()) return;
        setSynthLoading(true); setSynthImage(null); showToast("Synthesizing premium design asset...");
        try {
            const base64Url = await callImagenWithBackoff(synthPrompt);
            setSynthImage(base64Url); showToast("Asset synthesized successfully!");
        } catch (err) { showToast("Synthesis failed: " + err.message); } finally { setSynthLoading(false); }
    };

    const injectImageToIDE = () => {
        if (!synthImage) return;
        const assetHtml = `\n<div class="flex justify-center my-6">\n  <img src="${synthImage}" alt="${synthPrompt.replace(/"/g, '&quot;')}" class="rounded-2xl border border-blue-900/60 shadow-2xl max-w-full h-auto p-1 bg-black/40" />\n</div>\n`;
        applyAICode(prev => prev + assetHtml, "✨ Synthesized Design Asset Injected");
        showToast("Synthesized inline asset injected!"); setShowSynthModal(false); setSynthImage(null); setSynthPrompt("");
    };

    const handleRunAudit = async () => {
        setAuditLoading(true); setAuditData(null); setShowAuditModal(true); showToast("Analyzing workspace buffer threat vectors...");
        try {
            const systemPrompt = `You are the Hypercore Auditor. Return STRICT JSON: {"overallScore": 85, "findings": [{"severity":"HIGH","category":"SECURITY","title":"...","description":"...","suggestedFix":"..."}], "securityPatch": "..."}`;
            const payload = { contents: [{ parts: [{ text: `Audit this codebase:\n\`\`\`html\n${code}\n\`\`\`` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { overallScore: { type: "INTEGER" }, findings: { type: "ARRAY", items: { type: "OBJECT", properties: { severity: { type: "STRING" }, category: { type: "STRING" }, title: { type: "STRING" }, description: { type: "STRING" }, suggestedFix: { type: "STRING" } }, required: ["severity", "category", "title", "description", "suggestedFix"] } }, securityPatch: { type: "STRING" } }, required: ["overallScore", "findings", "securityPatch"] } } };
            const result = await callGeminiWithBackoff(payload);
            setAuditData(JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text));
            showToast("Code audit analysis complete!");
        } catch (err) { showToast("Code audit failed."); setShowAuditModal(false); } finally { setAuditLoading(false); }
    };

    const applyAuditPatch = () => {
        if (!auditData?.securityPatch) return;
        applyAICode(prev => prev + '\n\n' + auditData.securityPatch, "✨ Applied Remediation Patch");
        showToast("Remediation patch appended!"); setShowAuditModal(false); setAuditData(null);
    };

    return (
        <div className="h-full w-full flex flex-col bg-black overflow-hidden font-sans">
            <div className="h-10 bg-[#0a0c10] border-b border-[rgba(0,229,255,0.20)] flex items-center justify-between px-4 shrink-0 font-sans overflow-x-auto">
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Core Code Buffer</span>
                    {hasHistory && <button onClick={triggerUndo} className="flex items-center gap-1 text-[9px] bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 px-2 py-0.5 rounded transition-all"><Icon name="undo" size={10} /> Undo AI Action</button>}
                    <span className="hidden md:inline text-[9px] text-gray-600 mono">{codeAnalysis.summary}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={handleRunAudit} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-amber-400 hover:text-amber-300 transition-colors border border-amber-900/40 px-2.5 py-1 rounded bg-amber-950/20"><Icon name="shield" size={10} /> ✨ Code Audit</button>
                    <button onClick={() => setShowSynthModal(true)} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-purple-400 hover:text-purple-300 transition-colors border border-purple-900/40 px-2.5 py-1 rounded bg-purple-950/20"><Icon name="image" size={10} /> ✨ Asset Synth</button>
                    <button onClick={playBriefing} disabled={audioLoading} className={`flex items-center gap-1.5 text-[9px] font-bold uppercase transition-colors border px-2.5 py-1 rounded bg-black/50 ${activeAudio ? 'border-red-900 text-red-400' : 'border-[rgba(0,229,255,0.20)] text-gray-400'}`}><Icon name="volume" size={10} /> {activeAudio ? 'Stop Narrative' : '✨ Code Voiceover'}</button>
                    <button onClick={forceSave} className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#67e8f9] hover:text-white transition-colors ml-1"><Icon name="save" size={10} /> Force Save</button>
                </div>
            </div>

            <div className="bg-[#020202] border-b border-[rgba(0,229,255,0.20)]/40 px-4 py-3 shrink-0 flex flex-col gap-2.5 relative">
                {chipsLoading && <div className="absolute inset-0 chip-shimmer pointer-events-none" />}
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full relative">
                    {dynamicChips.map(chip => (
                        <button key={chip.id} onClick={() => runGeminiChip(chip.prompt, chip.label)} disabled={isGenerating || chipsLoading} className={`shrink-0 ${chip.dynamic ? 'bg-[#00e5ff]/15 border-[#67e8f9]/40' : 'bg-black/80 border-[rgba(0,229,255,0.20)]'} hover:bg-[#00e5ff]/20 border text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1.5`}>{chip.label}</button>
                    ))}
                </div>
            </div>
            <div className="flex-1 relative bg-black min-h-0 flex flex-col">
                <textarea className={`flex-grow w-full bg-black text-[#c9d1d9] p-6 mono text-xs md:text-sm resize-none focus:outline-none focus:ring-0 ${isGenerating ? 'opacity-40' : ''}`} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                <div className="h-12 bg-[#0a0c10] border-t border-[rgba(0,229,255,0.20)] px-4 flex items-center gap-3 shrink-0">
                    <Icon name="sparkles" size={14} className="text-[#67e8f9]" />
                    <input type="text" className="flex-1 bg-black/40 text-xs text-white placeholder-gray-600 focus:outline-none py-1 px-2 rounded border border-[rgba(0,229,255,0.20)]/60" placeholder="Command Gemini to patch this file..." value={customIdea} onChange={(e) => setCustomIdea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && customIdea.trim() !== "") { runGeminiChip(customIdea, customIdea.slice(0, 40)); setCustomIdea(""); } }} />
                    <button onClick={() => { if (customIdea.trim() !== "") { runGeminiChip(customIdea, customIdea.slice(0, 40)); setCustomIdea(""); } }} className="bg-[#0891b2] text-white px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-[#00e5ff]">Execute</button>
                </div>
            </div>

            {showSynthModal && (
                <div className="fixed inset-0 modal-backdrop z-[300] flex items-center justify-center p-4 fade-in font-sans">
                    <div className="bg-[#0a0c10] border border-purple-900/60 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2"><Icon name="image" size={16} className="text-purple-400" /> ✨ Imagen UI Asset Synth</h3>
                        <textarea className="w-full h-24 bg-black border border-[rgba(0,229,255,0.20)] rounded-xl p-4 text-xs focus:outline-none text-white resize-none mb-4" placeholder="Describe your design asset..." value={synthPrompt} onChange={(e) => setSynthPrompt(e.target.value)} disabled={synthLoading} />
                        {synthLoading && <div className="flex flex-col items-center justify-center py-6 gap-3"><Icon name="loader" size={24} className="text-purple-400 animate-spin" /></div>}
                        {synthImage && (
                            <div className="flex flex-col items-center border border-purple-950 bg-black/40 p-4 rounded-xl mb-4 gap-4">
                                <img src={synthImage} className="max-h-48 rounded-lg shadow-xl" />
                                <button onClick={injectImageToIDE} className="w-full h-10 bg-purple-700 text-white rounded-xl text-xs font-bold uppercase"><Icon name="check" size={14} /> ✨ Inject inline</button>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-4"><button onClick={() => { setShowSynthModal(false); setSynthImage(null); }} className="text-[10px] font-bold uppercase text-gray-400 hover:text-white px-4 py-2">Close</button>{!synthImage && <button onClick={handleSynthAsset} disabled={synthLoading || !synthPrompt.trim()} className="bg-purple-800 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase">✨ Synth Asset</button>}</div>
                    </div>
                </div>
            )}

            {showAuditModal && (
                <div className="fixed inset-0 modal-backdrop z-[300] flex items-center justify-center p-4 fade-in font-sans">
                    <div className="bg-[#0a0c10] border border-amber-900/60 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-sm font-black uppercase text-white mb-2 flex items-center gap-2"><Icon name="shield" size={16} className="text-amber-400" /> ✨ AI Code Threat Auditor</h3>
                        {auditLoading && <div className="flex justify-center py-20"><Icon name="loader" size={32} className="text-amber-400 animate-spin" /></div>}
                        {auditData && (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center justify-between p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl"><div><span className="text-[10px] uppercase font-bold text-gray-500">Overall Structural Safety</span><div className="text-3xl font-black text-amber-400">{auditData.overallScore} / 100</div></div></div>
                                <div className="space-y-3">
                                    {auditData.findings?.map((finding, idx) => (
                                        <div key={idx} className="p-4 bg-black border border-[rgba(0,229,255,0.20)] rounded-xl flex gap-4">
                                            <div className="flex flex-col gap-2 w-32"><span className="text-[8px] font-black px-2 py-0.5 rounded text-center bg-red-950 text-red-400">{finding.severity} RISK</span><span className="text-[9px] mono text-gray-500 text-center">{finding.category}</span></div>
                                            <div className="flex-1 space-y-1"><h5 className="text-xs font-bold text-white">{finding.title}</h5><p className="text-xs text-gray-400">{finding.description}</p><pre className="text-[10px] bg-[#0a0c10] text-[#67e8f9] p-3 rounded-lg mono overflow-x-auto max-w-full">{finding.suggestedFix}</pre></div>
                                        </div>
                                    ))}
                                </div>
                                {auditData.securityPatch && <div className="pt-4"><button onClick={applyAuditPatch} className="w-full h-11 bg-amber-700 text-white rounded-xl text-xs font-bold uppercase"><Icon name="check" size={14} /> ✨ Apply Security Patch</button></div>}
                            </div>
                        )}
                        <div className="flex justify-end pt-4"><button onClick={() => { setShowAuditModal(false); setAuditData(null); }} className="text-[10px] font-bold uppercase text-gray-400 hover:text-white px-5 py-2">Close Diagnostics</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

