import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useCallStore = create((set, get) => ({
  // Call state
  callStatus: "idle", // idle | calling | ringing | connected
  remoteUser: null,
  incomingCall: null, // { from, offer, callerInfo }
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMuted: false,
  isVideoOff: false,
  callDuration: 0,
  callTimer: null,

  // Start a call (caller side)
  startCall: async (user) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !user) return;

    try {
      // Try video+audio first, fallback to audio-only if camera is busy
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (camErr) {
        console.warn("Camera unavailable, falling back to audio-only:", camErr.message);
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        toast("Camera busy — audio-only mode", { icon: "🎙️" });
        set({ isVideoOff: true });
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice-candidate", {
            to: user._id,
            candidate: event.candidate,
          });
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        to: user._id,
        offer,
        callerInfo: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
      });

      set({
        callStatus: "calling",
        remoteUser: user,
        localStream: stream,
        remoteStream,
        peerConnection: pc,
      });

      // Auto-cancel after 30s if no answer
      setTimeout(() => {
        if (get().callStatus === "calling") {
          get().endCall();
          toast.error("No answer");
        }
      }, 30000);
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Camera/microphone access denied");
    }
  },

  // Accept incoming call (receiver side)
  acceptCall: async () => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;
    if (!incomingCall || !socket) return;

    try {
      // Try video+audio first, fallback to audio-only if camera is busy
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (camErr) {
        console.warn("Camera unavailable, falling back to audio-only:", camErr.message);
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        toast("Camera busy — audio-only mode", { icon: "🎙️" });
        set({ isVideoOff: true });
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice-candidate", {
            to: incomingCall.from,
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: incomingCall.from,
        answer,
      });

      // Start duration timer
      const timer = setInterval(() => {
        set((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);

      set({
        callStatus: "connected",
        remoteUser: incomingCall.callerInfo,
        localStream: stream,
        remoteStream,
        peerConnection: pc,
        incomingCall: null,
        callTimer: timer,
      });
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error("Camera/microphone access denied");
      get().rejectCall();
    }
  },

  // Reject incoming call
  rejectCall: () => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;
    if (incomingCall && socket) {
      socket.emit("call:reject", { to: incomingCall.from });
    }
    set({ incomingCall: null, callStatus: "idle" });
  },

  // End the call
  endCall: () => {
    const { peerConnection, localStream, remoteUser, callTimer } = get();
    const socket = useAuthStore.getState().socket;

    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (callTimer) clearInterval(callTimer);

    if (remoteUser && socket) {
      socket.emit("call:end", { to: remoteUser._id });
    }

    set({
      callStatus: "idle",
      remoteUser: null,
      incomingCall: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMuted: false,
      isVideoOff: false,
      callDuration: 0,
      callTimer: null,
    });
  },

  // Toggle mute
  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
      set({ isMuted: !isMuted });
    }
  },

  // Toggle video
  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = isVideoOff));
      set({ isVideoOff: !isVideoOff });
    }
  },

  // Handle incoming socket events (called once on socket connect)
  setupCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Incoming call offer
    socket.on("call:offer", ({ from, offer, callerInfo }) => {
      // Ignore if already in a call
      if (get().callStatus !== "idle") {
        socket.emit("call:reject", { to: from });
        return;
      }
      set({ incomingCall: { from, offer, callerInfo }, callStatus: "ringing" });
    });

    // Received answer to our offer
    socket.on("call:answer", async ({ answer }) => {
      const { peerConnection } = get();
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        // Start duration timer
        const timer = setInterval(() => {
          set((state) => ({ callDuration: state.callDuration + 1 }));
        }, 1000);
        set({ callStatus: "connected", callTimer: timer });
      }
    });

    // Received ICE candidate
    socket.on("call:ice-candidate", async ({ candidate }) => {
      const { peerConnection } = get();
      if (peerConnection && candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    // Call ended by remote
    socket.on("call:end", () => {
      const { peerConnection, localStream, callTimer } = get();
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (callTimer) clearInterval(callTimer);
      toast("Call ended", { icon: "📞" });
      set({
        callStatus: "idle",
        remoteUser: null,
        incomingCall: null,
        localStream: null,
        remoteStream: null,
        peerConnection: null,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
        callTimer: null,
      });
    });

    // Call rejected
    socket.on("call:reject", () => {
      const { peerConnection, localStream } = get();
      if (peerConnection) peerConnection.close();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      toast("Call was declined", { icon: "❌" });
      set({
        callStatus: "idle",
        remoteUser: null,
        localStream: null,
        remoteStream: null,
        peerConnection: null,
      });
    });
  },

  // Clean up listeners
  cleanupCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice-candidate");
    socket.off("call:end");
    socket.off("call:reject");
  },
}));
