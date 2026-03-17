import { useState, useRef } from "react";
import { MicIcon, SquareIcon, Loader2Icon } from "lucide-react";

function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(false);
      setIsRecording(false);
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className="relative group rounded-xl px-3 py-2 transition-all duration-300
        hover:scale-105 active:scale-95"
      style={{
        background: isRecording
          ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))"
          : "rgba(30,41,59,0.5)",
        border: `1px solid ${isRecording ? "rgba(239,68,68,0.4)" : "rgba(148,163,184,0.15)"}`,
        color: isRecording ? "#f87171" : "#94a3b8",
        boxShadow: isRecording ? "0 0 20px rgba(239,68,68,0.2)" : "none",
      }}
      title={isRecording ? "Stop recording" : "Voice to text"}
    >
      {isProcessing ? (
        <Loader2Icon className="w-5 h-5 animate-spin text-cyan-400" />
      ) : isRecording ? (
        <>
          <SquareIcon className="w-4 h-4 fill-current" />
          {/* Animated ring effect */}
          <span
            className="absolute inset-0 rounded-xl"
            style={{
              border: "2px solid rgba(239,68,68,0.4)",
              animation: "voiceRing 1.5s ease-out infinite",
            }}
          />
          {/* Recording dot */}
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 0 8px rgba(239,68,68,0.5)",
              animation: "recDot 1s ease infinite",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </span>
        </>
      ) : (
        <MicIcon className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
      )}

      <style>{`
        @keyframes voiceRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes recDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </button>
  );
}

export default VoiceRecorder;
