import { create } from 'zustand';

const useAgentStore = create((set) => ({
  claimedConversations: [],
  aiEnabled: false,
  claimConversation: (id) =>
    set((state) => ({
      claimedConversations: [...state.claimedConversations, id],
    })),
  releaseConversation: (id) =>
    set((state) => ({
      claimedConversations: state.claimedConversations.filter((c) => c !== id),
    })),
  toggleAI: () => set((state) => ({ aiEnabled: !state.aiEnabled })),
}));

export default useAgentStore;
