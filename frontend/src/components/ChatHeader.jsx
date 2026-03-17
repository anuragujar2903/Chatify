import { Loader2Icon, SearchIcon, SparklesIcon, XIcon, FileTextIcon, VideoIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const LANGUAGES = [
  { code: "English", flag: "🇬🇧" },
  { code: "Hindi", flag: "🇮🇳" },
  { code: "Spanish", flag: "🇪🇸" },
  { code: "French", flag: "🇫🇷" },
  { code: "German", flag: "🇩🇪" },
  { code: "Japanese", flag: "🇯🇵" },
  { code: "Chinese", flag: "🇨🇳" },
  { code: "Korean", flag: "🇰🇷" },
  { code: "Arabic", flag: "🇦🇪" },
  { code: "Portuguese", flag: "🇧🇷" },
];

function ChatHeader() {
  const {
    selectedUser, setSelectedUser, messages,
    isSummarizing, summarizeChat,
    summaryLanguage, setSummaryLanguage,
    setShowSearchModal,
    generateMeetingNotes, isGeneratingNotes,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const canSummarize = messages.length >= 3;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center max-h-[84px] px-6 flex-1"
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.4) 100%)",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: User info */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="w-11 rounded-full ring-2 ring-slate-700/50">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-slate-100 font-semibold text-sm">{selectedUser.fullName}</h3>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isOnline ? "#4ade80" : "#64748b",
                boxShadow: isOnline ? "0 0 6px rgba(74,222,128,0.5)" : "none",
              }}
            />
            <span className="text-[11px]" style={{ color: isOnline ? "#4ade80" : "#64748b" }}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Video Call button */}
        <button
          onClick={() => useCallStore.getState().startCall(selectedUser)}
          disabled={!isOnline}
          title={isOnline ? "Start video call" : "User is offline"}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            transition-all duration-300 hover:scale-[1.03] active:scale-95 overflow-hidden
            disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: isOnline
              ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))"
              : "rgba(30,41,59,0.4)",
            border: `1px solid ${isOnline ? "rgba(34,197,94,0.3)" : "rgba(148,163,184,0.1)"}`,
            color: isOnline ? "#4ade80" : "#64748b",
            boxShadow: isOnline ? "0 0 12px rgba(34,197,94,0.1)" : "none",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1))" }}
          />
          <VideoIcon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Live</span>
        </button>
        {/* Language selector */}
        <select
          value={summaryLanguage}
          onChange={(e) => setSummaryLanguage(e.target.value)}
          className="text-[11px] rounded-lg px-2 py-1.5 cursor-pointer outline-none transition-all
            hover:border-slate-600"
          style={{
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(148,163,184,0.1)",
            color: "#94a3b8",
            backdropFilter: "blur(8px)",
          }}
        >
          {LANGUAGES.map(({ code, flag }) => (
            <option key={code} value={code} style={{ background: "#0f172a" }}>
              {flag} {code}
            </option>
          ))}
        </select>

        {/* Summarize button */}
        <button
          onClick={summarizeChat}
          disabled={!canSummarize || isSummarizing}
          title={canSummarize ? "Summarize this chat with AI" : "Need at least 3 messages"}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed
            hover:scale-[1.03] active:scale-95 overflow-hidden"
          style={{
            background: canSummarize && !isSummarizing
              ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))"
              : "rgba(30,41,59,0.4)",
            border: "1px solid rgba(6,182,212,0.2)",
            color: "#67e8f9",
            boxShadow: canSummarize && !isSummarizing ? "0 0 16px rgba(6,182,212,0.1)" : "none",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))" }}
          />
          {isSummarizing ? (
            <>
              <Loader2Icon className="w-3.5 h-3.5 animate-spin relative z-10" />
              <span className="relative z-10">Summarizing…</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Summarize</span>
            </>
          )}
        </button>

        {/* AI Search */}
        <button
          onClick={() => setShowSearchModal(true)}
          title="Search chat with AI"
          className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            transition-all duration-300 hover:scale-[1.03] active:scale-95 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.12))",
            border: "1px solid rgba(139,92,246,0.2)",
            color: "#c4b5fd",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))" }}
          />
          <SearchIcon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">AI Search</span>
        </button>

        {/* Meeting Notes */}
        <button
          onClick={generateMeetingNotes}
          disabled={messages.length < 3 || isGeneratingNotes}
          title={messages.length >= 3 ? "Generate Meeting Notes" : "Need at least 3 messages"}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            transition-all duration-300 hover:scale-[1.03] active:scale-95 overflow-hidden
            disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.12))",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#4ade80",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1))" }}
          />
          {isGeneratingNotes ? (
            <>
              <Loader2Icon className="w-3.5 h-3.5 animate-spin relative z-10" />
              <span className="relative z-10">Generating…</span>
            </>
          ) : (
            <>
              <FileTextIcon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Notes</span>
            </>
          )}
        </button>

        {/* Close */}
        <button
          onClick={() => setSelectedUser(null)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500
            hover:text-slate-200 hover:bg-slate-700/40 transition-all duration-200"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        .chat-header-btn:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
export default ChatHeader;
