import { useEffect } from "react";
import { SparklesIcon, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function SummaryModal() {
  const { chatSummary, showSummaryModal, closeSummaryModal, selectedUser } = useChatStore();

  // Close on Escape key
  useEffect(() => {
    if (!showSummaryModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeSummaryModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSummaryModal, closeSummaryModal]);

  if (!showSummaryModal || !chatSummary) return null;

  // Parse bullet points — support lines starting with •, -, *, or numbered
  const bullets = chatSummary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && closeSummaryModal()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.97) 100%)",
          border: "1px solid rgba(34,211,238,0.25)",
          boxShadow: "0 0 60px rgba(34,211,238,0.15), 0 25px 50px rgba(0,0,0,0.5)",
          animation: "summaryModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Glow bar at top */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s linear infinite",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
            >
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-slate-100 font-semibold text-lg leading-tight">AI Summary</h2>
              <p className="text-slate-400 text-xs">
                Chat with {selectedUser?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={closeSummaryModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: "rgba(148,163,184,0.1)" }} />

        {/* Bullets */}
        <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {bullets.map((line, i) => {
            const isBullet = /^[•\-\*]/.test(line) || /^\d+[\.\)]/.test(line);
            // Strip leading bullet chars for clean display
            const text = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "");

            return (
              <div
                key={i}
                className="flex items-start gap-3 group"
                style={{ animation: `fadeSlideIn 0.35s ease ${i * 0.07}s both` }}
              >
                {isBullet && (
                  <div
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
                  />
                )}
                <p
                  className={`text-sm leading-relaxed ${
                    isBullet ? "text-slate-200" : "text-slate-400 italic"
                  }`}
                  style={!isBullet ? { paddingLeft: "20px" } : {}}
                >
                  {text || line}
                </p>
              </div>
            );
          })}
        </div>

      </div>


      {/* Keyframe styles */}
      <style>{`
        @keyframes summaryModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 99px; }
      `}</style>
    </div>
  );
}

export default SummaryModal;
