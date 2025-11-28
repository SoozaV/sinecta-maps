import { create } from 'zustand';

const DEFAULT_OFFLINE_MESSAGE = "Sin conexión. Intentando reconectar...";

interface GlobalState {
  isLoading: boolean;
  loadingCount: number;
  isOnline: boolean;
  offlineMessage?: string;
}

interface GlobalActions {
  startLoading: () => void;
  stopLoading: () => void;
  setOnline: () => void;
  setOffline: (message?: string) => void;
}

export const useGlobalStore = create<GlobalState & GlobalActions>((set) => ({
  isLoading: false,
  loadingCount: 0,
  isOnline: true,
  offlineMessage: undefined,

  startLoading: () => {
    set((state) => {
      const count = state.loadingCount + 1;
      return {
        loadingCount: count,
        isLoading: count > 0,
      };
    });
  },

  stopLoading: () => {
    set((state) => {
      const count = Math.max(state.loadingCount - 1, 0);
      return {
        loadingCount: count,
        isLoading: count > 0,
      };
    });
  },

  setOnline: () => {
    set((state) => {
      if (state.isOnline && !state.offlineMessage) return state;
      return {
        isOnline: true,
        offlineMessage: undefined,
      };
    });
  },

  setOffline: (message?: string) => {
    set((state) => {
      const offlineMessage = message ?? DEFAULT_OFFLINE_MESSAGE;
      if (!state.isOnline && state.offlineMessage === offlineMessage) return state;
      return {
        isOnline: false,
        offlineMessage,
      };
    });
  },
}));

// Selectores optimizados para evitar re-renders innecesarios
export const selectIsLoading = (state: GlobalState & GlobalActions) => state.isLoading;
export const selectIsOnline = (state: GlobalState & GlobalActions) => state.isOnline;
export const selectOfflineMessage = (state: GlobalState & GlobalActions) => state.offlineMessage;
