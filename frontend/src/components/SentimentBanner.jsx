import { useChatStore } from "../store/useChatStore";
import { ActivityIcon } from "lucide-react";

const MOOD_THEMES = {
  positive: {
    bg: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.08))",
    border: "rgba(34,197,94,0.25)",
    text: "#4ade80",
    glow: "rgba(34,197,94,0.1)",
    icon: "🌟",
  },
  negative: {
    bg: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.08))",
    border: "rgba(239,68,68,0.25)",
    text: "#f87171",
    glow: "rgba(239,68,68,0.1)",
    icon: "😔",
  },
  heated: {
    bg: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.08))",
    border: "rgba(249,115,22,0.25)",
    text: "#fb923c",
    glow: "rgba(249,115,22,0.1)",
    icon: "🔥",
  },
  excited: {
    bg: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(139,92,246,0.08))",
    border: "rgba(168,85,247,0.25)",
    text: "#c084fc",
    glow: "rgba(168,85,247,0.1)",
    icon: "🎉",
  },
  sad: {
    bg: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.08))",
    border: "rgba(59,130,246,0.25)",
    text: "#60a5fa",
    glow: "rgba(59,130,246,0.1)",
    icon: "💙",
  },
  neutral: {
    bg: "linear-gradient(135deg, rgba(148,163,184,0.06), rgba(100,116,139,0.06))",
    border: "rgba(148,163,184,0.15)",
    text: "#94a3b8",
    glow: "rgba(148,163,184,0.05)",
    icon: "💬",
  },
};

function SentimentBanner() {
  const { sentiment, isLoadingSentiment, messages } = useChatStore();

  if (isLoadingSentiment || !sentiment || messages.length < 2) return null;

  const theme = MOOD_THEMES[sentiment.mood] || MOOD_THEMES.neutral;

  return (
    <div
      className="mx-6 mt-2 rounded-xl overflow-hidden"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 20px ${theme.glow}`,
        animation: "bannerSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Animated emoji */}
        <span
          className="text-lg"
          style={{ animation: "emojiPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}
        >
          {sentiment.emoji}
        </span>

        {/* Mood info */}
        <div className="flex items-center gap-2 flex-1">
          <span style={{ color: theme.text }} className="text-xs font-semibold tracking-wide">
            {sentiment.label}
          </span>
          <span className="text-[10px] text-slate-500">•</span>
          <div className="flex items-center gap-1">
            <ActivityIcon className="w-3 h-3" style={{ color: theme.text, opacity: 0.6 }} />
            <span className="text-[10px] text-slate-500 capitalize">{sentiment.mood} vibes</span>
          </div>
        </div>

        {/* Mood indicator dots */}
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.text,
                opacity: 0.3 + i * 0.25,
                animation: `dotPulse 1.5s ease ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bannerSlide {
          from { opacity: 0; transform: translateY(-8px) scaleX(0.95); }
          to   { opacity: 1; transform: translateY(0) scaleX(1); }
        }
        @keyframes emojiPop {
          from { opacity: 0; transform: scale(0.3) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

export default SentimentBanner;
