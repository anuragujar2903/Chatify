import { useEffect } from "react";
import {
  XIcon, FileTextIcon, CheckCircleIcon, UsersIcon,
  ListTodoIcon, LightbulbIcon, ArrowRightIcon, Loader2Icon,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const PRIORITY_STYLES = {
  high: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", text: "#f87171", label: "🔴 High" },
  medium: { bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.25)", text: "#fbbf24", label: "🟡 Medium" },
  low: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", text: "#4ade80", label: "🟢 Low" },
};

function MeetingNotesModal() {
  const { meetingNotes, showMeetingNotesModal, closeMeetingNotesModal, isGeneratingNotes } = useChatStore();

  useEffect(() => {
    if (!showMeetingNotesModal) return;
    const handleKey = (e) => { if (e.key === "Escape") closeMeetingNotesModal(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showMeetingNotesModal, closeMeetingNotesModal]);

  if (!showMeetingNotesModal || !meetingNotes) return null;

  const { title, date, participants, agenda, decisions, actionItems, keyHighlights } = meetingNotes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && closeMeetingNotesModal()}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          background: "linear-gradient(165deg, rgba(15,23,42,0.98) 0%, rgba(20,27,45,0.98) 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 0 80px rgba(34,197,94,0.1), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          animation: "notesModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Glow bar */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #22c55e, #06b6d4, #22c55e, transparent)",
            backgroundSize: "300% 100%",
            animation: "glowShift 3s linear infinite",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #22c55e, #06b6d4)",
                boxShadow: "0 0 20px rgba(34,197,94,0.25)",
              }}
            >
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-slate-100 font-bold text-lg leading-tight">{title || "Meeting Notes"}</h2>
              <p className="text-slate-500 text-[11px]">{date}</p>
            </div>
          </div>
          <button
            onClick={closeMeetingNotesModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500
              hover:text-slate-200 hover:bg-slate-700/60 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-5 space-y-4 notes-scrollbar">
          {/* Participants */}
          {participants?.length > 0 && (
            <Section icon={<UsersIcon className="w-3.5 h-3.5" />} title="Participants" color="#06b6d4" delay={0}>
              <div className="flex flex-wrap gap-2">
                {participants.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(6,182,212,0.1)",
                      border: "1px solid rgba(6,182,212,0.2)",
                      color: "#67e8f9",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Agenda */}
          {agenda?.length > 0 && (
            <Section icon={<ListTodoIcon className="w-3.5 h-3.5" />} title="Agenda / Topics Discussed" color="#8b5cf6" delay={1}>
              {agenda.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1" style={{ animation: `itemSlide 0.3s ease ${i * 0.06}s both` }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#8b5cf6" }} />
                  <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Key Decisions */}
          {decisions?.length > 0 && (
            <Section icon={<CheckCircleIcon className="w-3.5 h-3.5" />} title="Key Decisions" color="#22c55e" delay={2}>
              {decisions.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1" style={{ animation: `itemSlide 0.3s ease ${i * 0.06}s both` }}>
                  <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-relaxed">{d}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Action Items */}
          {actionItems?.length > 0 && (
            <Section icon={<ArrowRightIcon className="w-3.5 h-3.5" />} title="Action Items" color="#f59e0b" delay={3}>
              {actionItems.map((item, i) => {
                const p = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg mb-1"
                    style={{
                      background: "rgba(15,23,42,0.5)",
                      border: "1px solid rgba(148,163,184,0.06)",
                      animation: `itemSlide 0.3s ease ${i * 0.06}s both`,
                    }}
                  >
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0"
                      style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.text }}
                    >
                      {p.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-200 font-medium">{item.person}</span>
                      <span className="text-sm text-slate-500 mx-1.5">→</span>
                      <span className="text-sm text-slate-400">{item.task}</span>
                    </div>
                  </div>
                );
              })}
            </Section>
          )}

          {/* Key Highlights */}
          {keyHighlights?.length > 0 && (
            <Section icon={<LightbulbIcon className="w-3.5 h-3.5" />} title="Key Highlights" color="#f97316" delay={4}>
              {keyHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1" style={{ animation: `itemSlide 0.3s ease ${i * 0.06}s both` }}>
                  <span className="text-sm">💡</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{h}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>

      <style>{`
        @keyframes notesModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glowShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes itemSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes sectionFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notes-scrollbar::-webkit-scrollbar { width: 4px; }
        .notes-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .notes-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 99px; }
      `}</style>
    </div>
  );
}

function Section({ icon, title, color, delay, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(30,41,59,0.3)",
        border: "1px solid rgba(148,163,184,0.06)",
        animation: `sectionFade 0.4s ease ${delay * 0.08}s both`,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          borderBottom: "1px solid rgba(148,163,184,0.06)",
          background: `linear-gradient(135deg, ${color}08, transparent)`,
        }}
      >
        <span style={{ color }}>{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export default MeetingNotesModal;
