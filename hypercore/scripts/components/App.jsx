// ===== HYPERCORE · App.jsx =====
// MAIN APP — root component

function App() {
    const persisted = useMemo(() => storage.load(), []);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // Added 'forge' to tabs
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [networkOnline, setNetworkOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Audio Reference
    const [activeAudio, setActiveAudio] = useState(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState("Kore");

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const triggerConfirmation = (title, message, onConfirm) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    // ---- PERSISTENT STATES ----
    const [projects, setProjects] = useState(() => persisted?.projects || [
        { id: 'p_default', name: 'main_kernel', content: DEFAULT_THREE_CODE, createdAt: Date.now(), updatedAt: Date.now() }
    ]);
    const [currentProjectId, setCurrentProjectId] = useState(() => persisted?.currentProjectId || 'p_default');
    const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];
    const [code, setCode] = useState(() => currentProject?.content || DEFAULT_THREE_CODE);
    const [codeHistory, setCodeHistory] = useState([]);

    const [modules, setModules] = useState(() => persisted?.modules || [
        { id: 'm1', type: 'UI', name: 'Glass Card', content: '<div class="glass-xray border border-[rgba(0,229,255,0.20)] p-6 rounded-2xl">{{content}}</div>', tags: ['ui', 'card'], description: 'Frosted glass card container.', params: ['content'], createdAt: Date.now() }
    ]);

    // Neo-Nexus Forge States
    const [tools, setTools] = useState(() => persisted?.tools || buildSeedTools());
    const [toolVault, setToolVault] = useState(() => persisted?.toolVault || []);
    const [forgeToasts, setForgeToasts] = useState([]);

    const [settings, setSettings] = useState(() => persisted?.settings || {
        aiAssistant: true, geminiModel: 'gemini-2.5-flash-preview-09-2025', deepThinking: true, grounding: false,
        structuredOutput: true, e2eEncryption: true, autoFormat: true, autoSave: true, dynamicChips: true, conversationMemory: true
    });

    const [conversations, setConversations] = useState(() => persisted?.conversations || { code: [], debug: [], design: [], architect: [] });
    const [actionLog, setActionLog] = useState(() => persisted?.actionLog || []);

    const [dynamicChips, setDynamicChips] = useState(() => {
        const analysis = analyzeCode(currentProject?.content || DEFAULT_THREE_CODE);
        return getStaticChips(analysis).map(c => ({ ...c, dynamic: false }));
    });
    const [chipsLoading, setChipsLoading] = useState(false);

    const showToast = (msg) => { setToastMsg(msg); setToastOpen(true); };
    const codeAnalysis = useMemo(() => analyzeCode(code), [code]);

    useEffect(() => {
        if (activeAudio) { activeAudio.pause(); setActiveAudio(null); }
    }, [currentProjectId, activeTab]);

    useEffect(() => {
        const goOnline = () => setNetworkOnline(true);
        const goOffline = () => setNetworkOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
    }, []);

    // Auto-Save
    useEffect(() => {
        if (!isAuthenticated) return;
        const id = setTimeout(() => {
            storage.save({
                projects, currentProjectId, modules, settings,
                tools, toolVault, // Including Forge state
                conversations: settings.conversationMemory ? conversations : { code: [], debug: [], design: [], architect: [] },
                actionLog: actionLog.slice(0, 50)
            });
        }, 400);
        return () => clearTimeout(id);
    }, [projects, currentProjectId, modules, settings, tools, toolVault, conversations, actionLog, isAuthenticated]);

    useEffect(() => {
        if (!settings.autoSave || !isAuthenticated) return;
        const id = setTimeout(() => {
            setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, content: code, updatedAt: Date.now() } : p));
        }, 800);
        return () => clearTimeout(id);
    }, [code, currentProjectId, settings.autoSave, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !settings.dynamicChips) return;
        let cancelled = false;
        const id = setTimeout(async () => {
            setChipsLoading(true);
            const chips = await generateContextualChips(code, codeAnalysis, actionLog);
            if (!cancelled) { setDynamicChips(chips); setChipsLoading(false); }
        }, 1500);
        return () => { cancelled = true; clearTimeout(id); setChipsLoading(false); };
    }, [code, isAuthenticated, settings.dynamicChips]);

    const updateCodeWithHistory = (newCodeOrFn, actionLabel) => {
        setCode(prevCode => {
            const newCode = typeof newCodeOrFn === 'function' ? newCodeOrFn(prevCode) : newCodeOrFn;
            setCodeHistory(h => [prevCode, ...h].slice(0, 20));
            return newCode;
        });
        if (actionLabel) setActionLog(prev => [actionLabel, ...prev].slice(0, 50));
    };

    const triggerUndo = () => {               if (codeHistory.length > 0) {
            setCode(codeHistory[0]); setCodeHistory(prev => prev.slice(1)); showToast("Reverted last AI modification");
        }
    };

    const playIntelligenceBriefing = async () => {
        if (activeAudio) { activeAudio.pause(); setActiveAudio(null); showToast("Audio Briefing Paused"); return; }
        setAudioLoading(true); showToast("Generating intelligence briefing...");
        try {
            const payload = { contents: [{ parts: [{ text: `Analyze this code context: [${codeAnalysis.summary}]. Write a concise, 1-2 sentence futuristic sci-fi narrator walkthrough.` }] }] };
            const textResult = await callGeminiWithBackoff(payload);
            const briefText = textResult.candidates?.[0]?.content?.parts?.[0]?.text || "Initialization complete.";
            const voiceBase64 = await callGeminiTTS(`Say in a professional futuristic tone: ${briefText}`, selectedVoice);
            setActiveAudio(playPCM16(voiceBase64, 24000));
            showToast("Voiced broadcast active");
        } catch (err) {
            showToast("Audio transmission failed: " + err.message);
        } finally { setAudioLoading(false); }
    };

    const createProject = (name, initialContent) => {
        const id = 'p_' + Date.now();
        const proj = { id, name: name || 'untitled', content: initialContent || '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>', createdAt: Date.now(), updatedAt: Date.now() };
        setProjects(prev => [proj, ...prev]); setCurrentProjectId(id); setCode(proj.content); setCodeHistory([]);
        showToast(`Project "${proj.name}" created`);
        return id;
    };

    const loadProject = (id) => {
        const p = projects.find(x => x.id === id); if (!p) return;
        setProjects(prev => prev.map(x => x.id === currentProjectId ? { ...x, content: code, updatedAt: Date.now() } : x));
        setCurrentProjectId(id); setCode(p.content); setCodeHistory([]); showToast(`Loaded "${p.name}"`);
    };

    const deleteProject = (id) => {
        if (projects.length === 1) { showToast('At least one project must remain'); return; }
        const remaining = projects.filter(p => p.id !== id);
        setProjects(remaining);
        if (currentProjectId === id) { setCurrentProjectId(remaining[0].id); setCode(remaining[0].content); setCodeHistory([]); }
        showToast('Project deleted');
    };

    const forceSave = () => {
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, content: code, updatedAt: Date.now() } : p));
        showToast('Project saved to local vault');
    };

    useEffect(() => {
        if (toastOpen) { const timer = setTimeout(() => setToastOpen(false), 3000); return () => clearTimeout(timer); }
    }, [toastOpen]);

    // Keyboard Shortcuts
    useEffect(() => {
        if (!isAuthenticated) return;
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); forceSave(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && activeTab === 'ide') {
                const target = e.target; if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) return;
                e.preventDefault(); triggerUndo();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isAuthenticated, code, codeHistory, activeTab, projects, currentProjectId]);

    // ---- Forge Toast Management ----
    const forgeToastTimers = useRef({});
    const removeForgeToast = (id) => {
        if (forgeToastTimers.current[id]) { clearTimeout(forgeToastTimers.current[id]); delete forgeToastTimers.current[id]; }
        setForgeToasts(prev => prev.filter(t => t.id !== id));
    };
    const clearAllForgeToasts = () => {
        Object.values(forgeToastTimers.current).forEach(clearTimeout); forgeToastTimers.current = {}; setForgeToasts([]);
    };
    const pauseForgeToast = (id) => {
        if (forgeToastTimers.current[id]) { clearTimeout(forgeToastTimers.current[id]); delete forgeToastTimers.current[id]; }
    };
    const resumeForgeToast = (id) => {
        forgeToastTimers.current[id] = setTimeout(() => removeForgeToast(id), 2000);
    };
    const pushForgeToast = (tool, copied = false) => {
        const id = Date.now() + Math.random();
        const newToast = { ...tool, id, copied, paused: false };
        setForgeToasts(prev => [newToast, ...prev].slice(0, 4));
        forgeToastTimers.current[id] = setTimeout(() => removeForgeToast(id), copied ? 4500 : 3500);
        if (copied) {
            setTimeout(() => setForgeToasts(prev => prev.map(t => t.id === id ? { ...t, copied: false } : t)), 1800);
        }
    };
    const copyForgeSnippet = (tool) => {
        try {
            navigator.clipboard.writeText(tool.snippet);
            setForgeToasts(prev => prev.map(t => t.id === tool.id ? { ...t, copied: true } : t));
            setTimeout(() => setForgeToasts(prev => prev.map(t => t.id === tool.id ? { ...t, copied: false } : t)), 1800);
            setActionLog(prev => [`Copied snippet: ${tool.name}`, ...prev].slice(0, 50));
        } catch (e) {}
    };


    const TABS = [
        { id: 'dashboard', icon: 'dashboard', label: 'System' },
        { id: 'ide',       icon: 'code',      label: 'IDE' },
        { id: 'preview',   icon: 'eye',       label: 'Preview' },
        { id: 'modules',   icon: 'layers',    label: 'Modules' },
        { id: 'forge',     icon: 'zap',       label: 'Forge' }, // ADDED NEO-NEXUS TAB
        { id: 'settings',  icon: 'settings',  label: 'Config' }
    ];

    return (
        <div className="h-screen w-full text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 overflow-hidden relative xray-grid">
            {isAuthenticated && <div className="scan-line" />}

            {!isAuthenticated ? (
                <AuthPage onLogin={() => { setIsAuthenticated(true); showToast("Access Granted"); }} hasVault={!!persisted} />
            ) : (
                <div className="flex-grow flex flex-col h-full w-full overflow-hidden">
                    {/* === X-RAY HEADER === */}
                    <header className="glass-xray skeletal-border border-x-0 border-t-0 safe-top safe-x shrink-0 z-[60] relative">
                        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-cyan-500 angular-cut flex items-center justify-center text-black glow-cyan cursor-pointer hover:rotate-6 transition-all shrink-0">
                                    <Icon name="binary" size={20} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-base sm:text-lg font-black tracking-tighter text-white uppercase italic leading-none truncate">
                                        Hyper<span className="text-cyan-400 glow-text">Core</span>
                                    </span>
                                    <span className="text-[8px] tracking-[0.35em] text-cyan-500/70 font-bold uppercase mt-0.5 mono">X-RAY ENGINE v6.9</span>
                                </div>
                                <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1.5 bg-black/40 border border-cyan-500/15 angular-cut-sm">
                                    <Icon name="folder" size={11} className="text-cyan-400" />
                                    <span className="text-[9px] font-bold text-cyan-200/80 uppercase tracking-widest truncate max-w-[160px] mono">{currentProject?.name || 'untitled'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {!networkOnline && (
                                    <span className="hidden sm:flex items-center gap-1 text-[9px] uppercase tracking-widest text-rose-400 font-bold mono">
                                        <Icon name="wifiOff" size={11} /> OFFLINE
                                    </span>
                                )}

                                <div className="hidden md:flex items-center gap-2 bg-black/40 border border-cyan-500/20 angular-cut-sm px-2 py-1">
                                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="bg-transparent text-[9px] font-black uppercase text-cyan-300/80 focus:outline-none cursor-pointer mono">
                                        <option value="Kore" className="bg-black">Kore</option>
                                        <option value="Fenrir" className="bg-black">Fenrir</option>
                                        <option value="Zephyr" className="bg-black">Zephyr</option>
                                    </select>
                                    <button onClick={playIntelligenceBriefing} disabled={audioLoading} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase py-0.5 px-2 angular-cut-sm transition-all ${activeAudio ? 'bg-rose-950 text-rose-300' : 'text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-100'}`}>
                                        {audioLoading ? <Icon name="loader" size={11} /> : <Icon name="volume" size={11} />}
                                        {activeAudio ? 'Stop' : '✨ Narrate'}
                                    </button>
                                </div>

                                <button onClick={() => setIsAgentOpen(!isAgentOpen)} className={`tap-target hidden sm:flex px-3 py-2 angular-cut-sm text-[10px] font-black uppercase tracking-[0.2em] border transition-all items-center gap-2 ${isAgentOpen ? 'bg-cyan-500 border-cyan-400 text-black glow-cyan' : 'border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10'}`}>
                                    <Icon name="sparkles" size={12} /> Intel Hub
                                </button>
                                <button onClick={() => setIsAuthenticated(false)} className="hidden sm:block text-[10px] font-bold text-cyan-500/70 hover:text-cyan-200 uppercase tracking-widest transition-colors">
                                    Logout
                                </button>
                                <button onClick={() => setMobileMenu(!mobileMenu)} className="tap-target sm:hidden text-cyan-300 flex items-center justify-center">
                                    <Icon name={mobileMenu ? 'x' : 'menu'} size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu */}
                        {mobileMenu && (
                            <div className="sm:hidden border-t border-cyan-500/20 fade-in">
                                <div className="px-4 py-3 grid grid-cols-2 gap-2">
                                    {TABS.map(t => (
                                        <button key={t.id} onClick={() => { setActiveTab(t.id); setMobileMenu(false); }} className={`tap-target px-3 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 angular-cut-sm transition-all ${activeTab === t.id ? 'bg-cyan-500 text-black' : 'bg-black/40 border border-cyan-500/20 text-cyan-300'}`}>
                                            <Icon name={t.icon} size={12} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </header>

                    {/* === X-RAY TAB BAR === */}
                    <div className="hidden sm:flex items-center px-4 gap-2 glass-xray border-b border-cyan-500/20 shrink-0 z-50 overflow-x-auto safe-x">
                        {TABS.map(t => (
                            <TabTrigger key={t.id} value={t.id} activeTab={activeTab} setActiveTab={setActiveTab} icon={t.icon} label={t.label} />
                        ))}
                        <div className="ml-auto flex items-center gap-1 text-[9px] text-cyan-500/60 mono uppercase tracking-widest pr-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${networkOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
                            HC-{activeTab.toUpperCase()}
                        </div>
                    </div>

                    <main className="flex-1 relative overflow-hidden flex">
                        <div className="flex-1 h-full overflow-hidden">
                            {activeTab === 'dashboard' && (
                                <DashboardPage
                                    projects={projects} currentProjectId={currentProjectId}
                                    loadProject={loadProject} createProject={createProject} deleteProject={deleteProject} renameProject={renameProject} duplicateProject={duplicateProject}
                                    setActiveTab={setActiveTab} codeAnalysis={codeAnalysis} modulesCount={modules.length} showToast={showToast} triggerConfirmation={triggerConfirmation}
                                />
                            )}                                    {activeTab === 'ide' && (
                                <IDEPage
                                    code={code} setCode={setCode} applyAICode={(c, label) => updateCodeWithHistory(c, label)}
                                    showToast={showToast} settings={settings} triggerUndo={triggerUndo} hasHistory={codeHistory.length > 0}
                                    dynamicChips={dynamicChips} chipsLoading={chipsLoading} codeAnalysis={codeAnalysis}
                                    forceSave={forceSave} actionLog={actionLog} currentProject={currentProject} onActionLog={(a) => setActionLog(prev => [a, ...prev].slice(0, 50))}
                                    playBriefing={playIntelligenceBriefing} audioLoading={audioLoading} activeAudio={activeAudio}
                                />
                            )}
                            {activeTab === 'preview' && <PreviewPage code={code} />}
                            {activeTab === 'modules' && (
                                <ModuleBuilder
                                    modules={modules} setModules={setModules} showToast={showToast}
                                    applyAICode={(c, label) => updateCodeWithHistory(c, label)} setActiveTab={setActiveTab} code={code} triggerConfirmation={triggerConfirmation}
                                />
                            )}
                            {activeTab === 'forge' && (
                                <ForgePage
                                    tools={tools} setTools={setTools} vault={toolVault} setVault={setToolVault}
                                    pushToast={pushForgeToast} showToast={showToast} networkOnline={networkOnline}
                                    actionLog={actionLog} setActionLog={(fn) => setActionLog(prev => fn(prev).slice(0, 50))} triggerConfirmation={triggerConfirmation}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <SettingsPage
                                    settings={settings} setSettings={setSettings} showToast={showToast} projects={projects} modules={modules} conversations={conversations}
                                    tools={tools} toolVault={toolVault} triggerConfirmation={triggerConfirmation}
                                    onClearVault={() => {
                                        triggerConfirmation('Clear Vault Data', 'Erase ALL local data (projects, modules, tools, conversations)? This action cannot be undone.', () => { storage.clear(); showToast('Local vault cleared — reload to apply changes'); });
                                    }}
                                    onClearAllConversations={() => { setConversations({ code: [], debug: [], design: [], architect: [] }); showToast('Conversation memory cleared'); }}
                                />
                            )}
                        </div>

                        {/* Intelligence Sidebar */}
                        <AgentSidebar
                            isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} code={code}
                            applyAICode={(c, label) => updateCodeWithHistory(c, label)} showToast={showToast} settings={settings}
                            codeAnalysis={codeAnalysis} conversations={conversations} appendConversation={(key, entry) => {
                                if (settings.conversationMemory) setConversations(prev => ({ ...prev, [key]: [...(prev[key] || []), entry].slice(-20) }));
                            }}
                            clearConversation={(key) => setConversations(prev => ({ ...prev, [key]: [] }))} actionLog={actionLog} selectedVoice={selectedVoice}
                        />
                    </main>

                    <footer className="glass-xray skeletal-border border-x-0 border-b-0 safe-bottom safe-x shrink-0">
                        <div className="h-10 px-4 sm:px-6 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-500/70 mono">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${networkOnline ? 'bg-cyan-400 animate-xray' : 'bg-rose-500'}`} /> Multicore</span>
                                <span className="hidden sm:flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-300 rounded-full" /> {settings.geminiModel}</span>
                                <span className="hidden md:flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {codeAnalysis.type} · {codeAnalysis.lines}L</span>
                            </div>
                            <span className="truncate text-cyan-600">VAULT · {projects.length} PROJ · {modules.length} MOD · {tools.length} TLS</span>
                        </div>
                    </footer>
                </div>
            )}
            <Toast message={toastMsg} isOpen={toastOpen} onClose={() => setToastOpen(false)} />
            <ForgeToastStack
                toasts={forgeToasts}
                removeToast={removeForgeToast}
                clearAllToasts={clearAllForgeToasts}
                copySnippet={copyForgeSnippet}
                pauseToast={pauseForgeToast}
                resumeToast={resumeForgeToast}
            />

            {/* CONFIRMATION MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 modal-backdrop z-[300] flex items-center justify-center p-4 fade-in font-sans safe-x">
                    <div className="glass-xray skeletal-border angular-cut w-full max-w-md p-6 shadow-2xl glow-cyan relative overflow-hidden">
                        <div className="scan-line" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-50 mb-2 flex items-center gap-2 glow-text">
                            <Icon name="alert" size={16} className="text-cyan-400" />
                            {confirmModal.title || 'System Confirmation'}
                        </h3>
                        <p className="text-xs text-cyan-100/60 mb-6 leading-relaxed">{confirmModal.message}</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="tap-target text-[10px] font-bold uppercase tracking-widest text-cyan-500/70 hover:text-cyan-100 px-4 py-2">Abort</button>
                            <button
                                onClick={() => { if (confirmModal.onConfirm) confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }}
                                className="tap-target bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 angular-cut-sm text-[10px] font-bold uppercase tracking-widest"
                            >Execute</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

