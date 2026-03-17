import { useEffect, useRef } from "react";
import { Loader2Icon, SearchIcon, SparklesIcon, XIcon, BotIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function AIChatSearch() {
  const {
    showSearchModal, setShowSearchModal,
    aiSearchQuery, setAiSearchQuery,
    aiSearchAnswer, aiSearchChat, isSearching,
  } = useChatStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!showSearchModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setShowSearchModal(false);
    };
    window.addEventListener("keydown", handleKey);
    // Focus input when modal opens
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSearchModal, setShowSearchModal]);

  if (!showSearchModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    aiSearchChat();
  };

  const suggestions = [
    "What did we plan?",
    "Any deadlines mentioned?",
    "What was the last decision?",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && setShowSearchModal(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(165deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 50%, rgba(20,27,45,0.98) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 80px rgba(139,92,246,0.12), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          animation: "searchModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Glow bar */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #8b5cf6, transparent)",
            backgroundSize: "300% 100%",
            animation: "glowShift 3s linear infinite",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 0 20px rgba(139,92,246,0.25)",
              }}
            >
              <SearchIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-slate-100 font-bold text-lg leading-tight">AI Chat Search</h2>
              <p className="text-slate-500 text-[11px]">Ask anything about this conversation</p>
            </div>
          </div>
          <button
            onClick={() => setShowSearchModal(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500
              hover:text-slate-200 hover:bg-slate-700/60 transition-all duration-200"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="px-6 pb-3">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(139,92,246,0.15)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              placeholder='Try: "What did we discuss about the project?"'
              className="w-full py-3.5 pl-10 pr-14 text-sm text-slate-200 placeholder-slate-600 outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!aiSearchQuery.trim() || isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center
                transition-all duration-300 disabled:opacity-30 hover:scale-110 active:scale-95"
              style={{
                background: !aiSearchQuery.trim() ? "transparent" : "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: aiSearchQuery.trim() ? "0 0 12px rgba(139,92,246,0.3)" : "none",
              }}
            >
              {isSearching ? (
                <Loader2Icon className="w-4 h-4 text-white animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </form>

        {/* Quick suggestions when no answer yet */}
        {!aiSearchAnswer && !isSearching && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setAiSearchQuery(s); }}
                className="px-3 py-1 rounded-full text-[11px] transition-all duration-200
                  hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  color: "#a78bfa",
                  animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {isSearching && (
          <div className="px-6 pb-5">
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(139,92,246,0.05)",
                border: "1px solid rgba(139,92,246,0.1)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <BotIcon className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded-full animate-pulse" style={{ width: "80%", background: "rgba(139,92,246,0.15)" }} />
                <div className="h-3 rounded-full animate-pulse" style={{ width: "55%", background: "rgba(139,92,246,0.1)" }} />
              </div>
            </div>
          </div>
        )}

        {/* Answer */}
        {aiSearchAnswer && !isSearching && (
          <div className="px-6 pb-5" style={{ animation: "fadeUp 0.4s ease both" }}>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(139,92,246,0.05)",
                border: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    boxShadow: "0 0 12px rgba(139,92,246,0.2)",
                  }}
                >
                  <BotIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{aiSearchAnswer}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes searchModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glowShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default AIChatSearch;
