import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogEntry, AuditActionType } from '../types/audit';
import { useAuthStore } from './useAuthStore';

interface AuditLogState {
    logs: AuditLogEntry[];
    addLog: (actionType: AuditActionType, details: string, entityId?: string) => void;
}

export const useAuditLogStore = create<AuditLogState>()(
    persist(
        (set) => ({
            logs: [],

            addLog: (actionType, details, entityId) => {
                const { user } = useAuthStore.getState();
                if (!user) return; // Should not happen if user is logged in

                const newLog: AuditLogEntry = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    userId: user.id,
                    userName: user.name,
                    actionType,
                    details,
                    entityId,
                };

                set((state) => ({ logs: [newLog, ...state.logs] }));
            },
        }),
        {
            name: 'audit-log-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
