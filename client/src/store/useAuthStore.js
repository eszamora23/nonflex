import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: null,
  tenant: null,
  setAuth: ({ token, tenant }) => set({ token, tenant }),
}));

export default useAuthStore;
