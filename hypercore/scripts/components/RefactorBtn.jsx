// ===== HYPERCORE · RefactorBtn.jsx =====
// Refactor button primitive

const RefactorBtn = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-2 bg-black border border-[rgba(0,229,255,0.20)] p-2.5 rounded-lg hover:border-[#00e5ff] transition-all group">
        <Icon name={icon} size={14} className="text-gray-500 group-hover:text-[#67e8f9]" />
        <span className="text-[9px] font-bold uppercase text-gray-400 group-hover:text-white">{label}</span>
    </button>
);

