import { create } from "zustand";

interface UIStore {
  globalLoading: boolean;
  deleteModal: { open: boolean; id: string | null; type: string };

  setGlobalLoading: (loading: boolean) => void;
  openDeleteModal: (id: string, type: string) => void;
  closeDeleteModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  globalLoading: false,
  deleteModal: { open: false, id: null, type: "" },

  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  openDeleteModal: (id, type) =>
    set({ deleteModal: { open: true, id, type } }),

  closeDeleteModal: () =>
    set({ deleteModal: { open: false, id: null, type: "" } }),
}));
