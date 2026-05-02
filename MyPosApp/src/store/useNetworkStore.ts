import { create } from 'zustand';

interface NetworkState {
    isOnline: boolean;
    setIsOnline: (isOnline: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
    isOnline: true, // Assume online by default
    setIsOnline: (isOnline: boolean) => set({ isOnline }),
}));
