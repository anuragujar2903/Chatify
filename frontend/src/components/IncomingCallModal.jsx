import { PhoneIcon, PhoneOffIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function IncomingCallModal() {
  const { incomingCall, callStatus, acceptCall, rejectCall } = useCallStore();

  if (!incomingCall || callStatus !== "ringing") return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        animation: "incomingFade 0.3s ease both",
      }}
    >
      <div
        className="w-full max-w-xs rounded-3xl overflow-hidden text-center"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(20,27,45,0.98) 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 0 80px rgba(34,197,94,0.15), 0 30px 60px rgba(0,0,0,0.5)",
          animation: "incomingSlide 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Glow bar */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #4ade80, #06b6d4, #4ade80, transparent)",
            backgroundSize: "300% 100%",
            animation: "glowShift 2s linear infinite",
          }}
        />

        <div className="px-8 py-8">
          {/* Avatar with pulse ring */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(34,197,94,0.3)",
                animation: "ringPulse 1.5s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(34,197,94,0.2)",
                animation: "ringPulse 1.5s ease-out 0.5s infinite",
              }}
            />
            <img
              src={incomingCall.callerInfo?.profilePic || "/avatar.png"}
              alt=""
              className="w-24 h-24 rounded-full object-cover ring-3 ring-green-500/30 relative z-10"
            />
          </div>

          {/* Caller name */}
          <h3 className="text-white font-bold text-lg mb-1">
            {incomingCall.callerInfo?.fullName || "Someone"}
          </h3>
          <p className="text-slate-400 text-sm mb-8">Incoming video call…</p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-8">
            {/* Reject */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all
                  hover:scale-110 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 0 24px rgba(239,68,68,0.3)",
                }}
              >
                <PhoneOffIcon className="w-7 h-7 text-white" />
              </button>
              <span className="text-xs text-slate-500">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all
                  hover:scale-110 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: "0 0 24px rgba(34,197,94,0.3)",
                  animation: "acceptPulse 1.5s ease infinite",
                }}
              >
                <PhoneIcon className="w-7 h-7 text-white" />
              </button>
              <span className="text-xs text-slate-500">Accept</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes incomingFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes incomingSlide {
          from { opacity: 0; transform: scale(0.85) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glowShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes acceptPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}

export default IncomingCallModal;
