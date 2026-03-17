import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isSummarizing: false,
  chatSummary: null,
  showSummaryModal: false,
  summaryLanguage: "English",

  // Smart Replies
  smartReplies: [],
  isLoadingSmartReplies: false,

  // Sentiment
  sentiment: null,
  isLoadingSentiment: false,

  // AI Search
  aiSearchQuery: "",
  aiSearchAnswer: null,
  isSearching: false,
  showSearchModal: false,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Auto-fetch smart replies & sentiment after loading messages
      get().fetchSmartReplies();
      get().fetchSentiment();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
      // Refresh smart replies after sending
      setTimeout(() => get().fetchSmartReplies(), 500);
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      // Refresh smart replies & sentiment on new message
      get().fetchSmartReplies();
      get().fetchSentiment();

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  summarizeChat: async () => {
    const { selectedUser, summaryLanguage } = get();
    if (!selectedUser) return;

    set({ isSummarizing: true });
    try {
      const res = await axiosInstance.post(`/messages/summarize/${selectedUser._id}`, {
        language: summaryLanguage,
      });
      set({ chatSummary: res.data.summary, showSummaryModal: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to summarize chat");
    } finally {
      set({ isSummarizing: false });
    }
  },

  closeSummaryModal: () => set({ showSummaryModal: false, chatSummary: null }),
  setSummaryLanguage: (language) => set({ summaryLanguage: language }),

  // === Smart Replies ===
  fetchSmartReplies: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ isLoadingSmartReplies: true });
    try {
      const res = await axiosInstance.post(`/messages/smart-replies/${selectedUser._id}`);
      set({ smartReplies: res.data.replies || [] });
    } catch {
      set({ smartReplies: [] });
    } finally {
      set({ isLoadingSmartReplies: false });
    }
  },

  // === Sentiment Analysis ===
  fetchSentiment: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ isLoadingSentiment: true });
    try {
      const res = await axiosInstance.post(`/messages/sentiment/${selectedUser._id}`);
      set({ sentiment: res.data });
    } catch {
      set({ sentiment: null });
    } finally {
      set({ isLoadingSentiment: false });
    }
  },

  // === AI Search ===
  setAiSearchQuery: (query) => set({ aiSearchQuery: query }),
  setShowSearchModal: (show) => set({ showSearchModal: show, aiSearchAnswer: null, aiSearchQuery: "" }),

  aiSearchChat: async () => {
    const { selectedUser, aiSearchQuery } = get();
    if (!selectedUser || !aiSearchQuery.trim()) return;

    set({ isSearching: true });
    try {
      const res = await axiosInstance.post(`/messages/ai-search/${selectedUser._id}`, {
        query: aiSearchQuery,
      });
      set({ aiSearchAnswer: res.data.answer });
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      set({ isSearching: false });
    }
  },

  // === Meeting Notes ===
  meetingNotes: null,
  isGeneratingNotes: false,
  showMeetingNotesModal: false,

  generateMeetingNotes: async () => {
    const { selectedUser, summaryLanguage } = get();
    if (!selectedUser) return;

    set({ isGeneratingNotes: true });
    try {
      const res = await axiosInstance.post(`/messages/meeting-notes/${selectedUser._id}`, {
        language: summaryLanguage,
      });
      set({ meetingNotes: res.data.notes, showMeetingNotesModal: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate meeting notes");
    } finally {
      set({ isGeneratingNotes: false });
    }
  },

  closeMeetingNotesModal: () => set({ showMeetingNotesModal: false, meetingNotes: null }),
}));
