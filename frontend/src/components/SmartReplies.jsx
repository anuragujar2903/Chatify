import { useChatStore } from "../store/useChatStore";
import { ZapIcon } from "lucide-react";

function SmartReplies({ onSelectReply }) {
  const { smartReplies, isLoadingSmartReplies } = useChatStore();

  if (isLoadingSmartReplies) {
    return (
      <div className="flex items-center gap-2 mb-3 max-w-3xl mx-auto">
        <div className="w-4 h-4 rounded-md animate-pulse" style={{ background: "rgba(6,182,212,0.2)" }} />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-full animate-pulse"
            style={{
              width: `${55 + i * 18}px`,
              height: "30px",
              background: "linear-gradient(90deg, rgba(30,41,59,0.4), rgba(30,41,59,0.7), rgba(30,41,59,0.4))",
              backgroundSize: "200% 100%",
              animation: `shimmerLoad 1.5s linear infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (!smartReplies.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 max-w-3xl mx-auto">
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.12))",
          color: "#67e8f9",
        }}
      >
        <ZapIcon className="w-3 h-3" />
        Quick
      </div>

      {smartReplies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelectReply(reply)}
          className="group relative px-3.5 py-1.5 rounded-full text-xs font-medium
            transition-all duration-300 cursor-pointer overflow-hidden
            hover:shadow-lg active:scale-95"
          style={{
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(6,182,212,0.2)",
            color: "#e2e8f0",
            backdropFilter: "blur(8px)",
            animation: `chipSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s both`,
          }}
        >
          {/* Hover glow effect */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))",
            }}
          />
          <span className="relative z-10">{reply}</span>
        </button>
      ))}

      <style>{`
        @keyframes chipSlideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmerLoad {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default SmartReplies;
