import { useEffect, useRef } from "react";
import {
  PhoneOffIcon, MicIcon, MicOffIcon,
  VideoIcon, VideoOffIcon,
} from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function VideoCall() {
  const {
    callStatus, remoteUser, localStream, remoteStream,
    isMuted, isVideoOff, callDuration,
    endCall, toggleMute, toggleVideo,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === "idle" || callStatus === "ringing") return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={remoteUser?.profilePic || "/avatar.png"}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <div>
            <h3 className="text-white font-semibold text-sm">{remoteUser?.fullName}</h3>
            <p className="text-xs" style={{ color: callStatus === "connected" ? "#4ade80" : "#fbbf24" }}>
              {callStatus === "calling" ? "Calling…" : formatDuration(callDuration)}
            </p>
          </div>
        </div>

        {/* Call quality indicator */}
        {callStatus === "connected" && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: "3px",
                  height: `${8 + i * 4}px`,
                  background: "#4ade80",
                  opacity: 0.4 + i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Remote video (full screen) */}
        {callStatus === "connected" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-cyan-500/30"
              style={{
                boxShadow: "0 0 40px rgba(6,182,212,0.2)",
                animation: "callPulse 2s ease infinite",
              }}
            >
              <img
                src={remoteUser?.profilePic || "/avatar.png"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-slate-400 text-sm">Calling {remoteUser?.fullName}…</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  style={{ animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Local video (small overlay) */}
        <div
          className="absolute bottom-24 right-6 w-36 h-48 rounded-2xl overflow-hidden"
          style={{
            border: "2px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            animation: "localVideoIn 0.4s ease both",
          }}
        >
          {isVideoOff ? (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <VideoOffIcon className="w-8 h-8 text-slate-500" />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror-video"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-center gap-5 py-6"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
        }}
      >
        {/* Mute */}
        <button
          onClick={toggleMute}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
            hover:scale-110 active:scale-95"
          style={{
            background: isMuted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${isMuted ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)"}`,
          }}
        >
          {isMuted ? (
            <MicOffIcon className="w-6 h-6 text-red-400" />
          ) : (
            <MicIcon className="w-6 h-6 text-white" />
          )}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
            hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 0 30px rgba(239,68,68,0.4)",
          }}
        >
          <PhoneOffIcon className="w-7 h-7 text-white" />
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
            hover:scale-110 active:scale-95"
          style={{
            background: isVideoOff ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${isVideoOff ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)"}`,
          }}
        >
          {isVideoOff ? (
            <VideoOffIcon className="w-6 h-6 text-red-400" />
          ) : (
            <VideoIcon className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <style>{`
        .mirror-video {
          transform: scaleX(-1);
        }
        @keyframes callPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.3); }
          50% { box-shadow: 0 0 0 20px rgba(6,182,212,0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes localVideoIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default VideoCall;
