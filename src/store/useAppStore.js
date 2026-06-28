import { create } from 'zustand'

const useAppStore = create((set) => ({
  // Default custom increment for stitch counter
  customIncrement: 5,
  setCustomIncrement: (n) => set({ customIncrement: n }),

  // Trigger refetch across pages after mutations
  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))

export default useAppStore
