import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActionType = 'CREATE_ORDER' | 'UPDATE_PRODUCT' | 'CREATE_CUSTOMER';

interface QueuedAction {
    id: string;
    type: ActionType;
    payload: any;
    timestamp: number;
}

interface SyncQueueState {
    queue: QueuedAction[];
    addToQueue: (type: ActionType, payload: any) => void;
    removeFomQueue: (actionId: string) => void;
    clearQueue: () => void;
}

export const useSyncQueueStore = create<SyncQueueState>()(
    persist(
        (set) => ({
            queue: [],

            addToQueue: (type, payload) => {
                const newAction: QueuedAction = {
                    id: Date.now().toString(),
                    type,
                    payload,
                    timestamp: Date.now(),
                };
                set((state) => ({ queue: [...state.queue, newAction] }));
            },

            removeFomQueue: (actionId) => {
                set((state) => ({
                    queue: state.queue.filter((action) => action.id !== actionId),
                }));
            },

            clearQueue: () => set({ queue: [] }),
        }),
        {
            name: 'sync-queue-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
