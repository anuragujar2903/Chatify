import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import SmartReplies from "./SmartReplies";
import VoiceRecorder from "./VoiceRecorder";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="px-6 py-4"
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.6) 100%)",
        borderTop: "1px solid rgba(148,163,184,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Smart Reply Suggestions */}
      <SmartReplies onSelectReply={(reply) => setText(reply)} />

      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center
                transition-all hover:scale-110"
              type="button"
              style={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <XIcon className="w-3 h-3 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
        <div
          className="flex-1 relative rounded-xl overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(148,163,184,0.08)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            className="w-full bg-transparent py-3 px-4 text-sm text-slate-200 placeholder-slate-600 outline-none"
            placeholder="Type your message..."
          />
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Voice Recorder */}
        <VoiceRecorder onTranscript={(t) => setText((prev) => (prev ? prev + " " + t : t))} />

        {/* Image Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            hover:scale-105 active:scale-95"
          style={{
            background: imagePreview ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
            border: `1px solid ${imagePreview ? "rgba(6,182,212,0.3)" : "rgba(148,163,184,0.1)"}`,
            color: imagePreview ? "#67e8f9" : "#64748b",
          }}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Send */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
            disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-lg"
          style={{
            background: text.trim() || imagePreview
              ? "linear-gradient(135deg, #0891b2, #0e7490)"
              : "rgba(30,41,59,0.5)",
            border: "1px solid rgba(6,182,212,0.2)",
            color: "#f0f9ff",
            boxShadow: text.trim() || imagePreview ? "0 0 16px rgba(8,145,178,0.25)" : "none",
          }}
        >
          <SendIcon className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
