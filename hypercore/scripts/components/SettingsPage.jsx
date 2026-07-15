// ===== HYPERCORE · SettingsPage.jsx =====
// System settings & vault administration. Referenced by App.jsx in the
// original monolith but its definition was missing from the source. This
// stub honours the documented prop API and provides the essential controls:
//  - Toggle conversation memory
//  - Select Gemini model / voice
//  - Purge conversations / vault

function SettingsPage({
    settings, setSettings, showToast, projects, modules, conversations, tools, toolVault,
    triggerConfirmation, onClearVault, onClearAllConversations
}) {
    const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));

    const stat = (label, value) => (
        <div className="glass-xray skeletal-border angular-cut-sm p-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-cyan-600 mb-1">{label}</div>
            <div className="text-lg font-black text-cyan-100 mono">{value}</div>
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col p-6 gap-6 overflow-auto">
            <header className="shrink-0">
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-cyan-100 glow-text">System Settings</h2>
                <p className="text-xs text-cyan-500/60 mt-1">Configure engine behaviour and manage your local vault.</p>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stat('Projects', projects?.length ?? 0)}
                {stat('Modules', modules?.length ?? 0)}
                {stat('Tools', tools?.length ?? 0)}
                {stat('Vault Items', toolVault?.length ?? 0)}
            </section>

            <section className="glass-xray skeletal-border angular-cut p-5 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Engine</div>

                <label className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-cyan-100 font-bold">Gemini model</div>
                        <div className="text-[11px] text-cyan-500/60">Model used for all AI actions.</div>
                    </div>
                    <select
                        value={settings.geminiModel || 'gemini-2.5-flash'}
                        onChange={(e) => update({ geminiModel: e.target.value })}
                        className="bg-black/60 border border-[rgba(0,229,255,0.30)] text-cyan-100 text-xs rounded px-3 py-2 focus:outline-none"
                    >
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </select>
                </label>

                <label className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-cyan-100 font-bold">Conversation memory</div>
                        <div className="text-[11px] text-cyan-500/60">Persist last 20 messages per agent.</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={!!settings.conversationMemory}
                        onChange={(e) => update({ conversationMemory: e.target.checked })}
                        className="w-5 h-5 accent-cyan-400"
                    />
                </label>

                <label className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-cyan-100 font-bold">TTS voice</div>
                        <div className="text-[11px] text-cyan-500/60">Voice preset for intelligence briefings.</div>
                    </div>
                    <select
                        value={settings.voice || 'Kore'}
                        onChange={(e) => update({ voice: e.target.value })}
                        className="bg-black/60 border border-[rgba(0,229,255,0.30)] text-cyan-100 text-xs rounded px-3 py-2 focus:outline-none"
                    >
                        <option>Kore</option>
                        <option>Charon</option>
                        <option>Puck</option>
                        <option>Aoede</option>
                    </select>
                </label>
            </section>

            <section className="glass-xray skeletal-border angular-cut p-5 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">Danger zone</div>
                <div className="flex flex-col md:flex-row gap-3">
                    <button
                        onClick={onClearAllConversations}
                        className="tap-target flex-1 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest py-3 angular-cut-sm"
                    >Clear Conversations</button>
                    <button
                        onClick={onClearVault}
                        className="tap-target flex-1 bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest py-3 angular-cut-sm"
                    >Purge Vault</button>
                </div>
                <p className="text-[10px] text-cyan-600/60 mt-2">
                    Purging the vault wipes projects, modules, tools and conversations from local storage. This cannot be undone.
                </p>
            </section>
        </div>
    );
}
