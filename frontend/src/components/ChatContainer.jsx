import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import SummaryModal from "./SummaryModal";
import SentimentBanner from "./SentimentBanner";
import AIChatSearch from "./AIChatSearch";
import MeetingNotesModal from "./MeetingNotesModal";

// Keyword highlighting utility
function highlightText(text) {
  if (!text) return text;

  const patterns = [
    // Dates & Times
    { regex: /\b(today|tomorrow|yesterday|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, type: "date" },
    { regex: /\b(\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?)\b/g, type: "date" },
    { regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}/gi, type: "date" },
    { regex: /\b\d{1,2}\s*(am|pm)\b/gi, type: "date" },
    { regex: /\b\d{1,2}:\d{2}\b/g, type: "date" },
    // Tasks & Actions
    { regex: /\b(todo|to-do|need to|don't forget|dont forget|reminder|deadline|asap|urgent|important)\b/gi, type: "task" },
  ];

  let allMatches = [];
  for (const { regex, type } of patterns) {
    let match;
    const r = new RegExp(regex.source, regex.flags);
    while ((match = r.exec(text)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type });
    }
  }

  allMatches.sort((a, b) => a.start - b.start);
  const filtered = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  if (filtered.length === 0) return text;

  const parts = [];
  let pos = 0;
  let key = 0;
  for (const m of filtered) {
    if (m.start > pos) parts.push(<span key={key++}>{text.slice(pos, m.start)}</span>);
    parts.push(
      <span key={key++} className={`kw-${m.type}`} title={m.type === "date" ? "📅 Date/Time" : "📋 Task/Action"}>
        {m.text}
      </span>
    );
    pos = m.end;
  }
  if (pos < text.length) parts.push(<span key={key++}>{text.slice(pos)}</span>);
  return parts;
}

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <SummaryModal />
      <AIChatSearch />
      <MeetingNotesModal />
      <ChatHeader />
      <SentimentBanner />

      <div className="flex-1 px-6 overflow-y-auto py-6 chat-area">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`chat ${isMine ? "chat-end" : "chat-start"}`}
                  style={{ animation: `msgFade 0.3s ease ${Math.min(idx * 0.02, 0.3)}s both` }}
                >
                  <div
                    className="chat-bubble relative max-w-[75%]"
                    style={{
                      background: isMine
                        ? "linear-gradient(135deg, #0891b2, #0e7490)"
                        : "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))",
                      color: isMine ? "#f0f9ff" : "#e2e8f0",
                      border: isMine
                        ? "1px solid rgba(6,182,212,0.3)"
                        : "1px solid rgba(148,163,184,0.1)",
                      boxShadow: isMine
                        ? "0 4px 12px rgba(8,145,178,0.2)"
                        : "0 2px 8px rgba(0,0,0,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg h-48 object-cover mb-1"
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                      />
                    )}
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{highlightText(msg.text)}</p>
                    )}
                    <p
                      className="text-[10px] mt-1.5 flex items-center gap-1"
                      style={{ opacity: 0.5 }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      <style>{`
        @keyframes msgFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kw-date {
          background: linear-gradient(135deg, rgba(250,204,21,0.18), rgba(234,179,8,0.12));
          color: #fbbf24;
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 500;
          border: 1px solid rgba(250,204,21,0.15);
        }
        .kw-task {
          background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.12));
          color: #fca5a5;
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 500;
          border: 1px solid rgba(239,68,68,0.15);
        }
        .chat-area::-webkit-scrollbar { width: 5px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 99px; }
        .chat-area::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.25); }
      `}</style>
    </>
  );
}

export default ChatContainer;
