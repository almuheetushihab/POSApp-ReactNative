import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shift, CashDrawerInfo } from '../types/shift';
import { User } from '../types/user';

interface ShiftState {
    shifts: Shift[];
    currentShift: Shift | null;
    
    // Actions
    clockIn: (user: User, startingCash: number) => void;
    clockOut: (actualCash: number, notes?: string) => void;
    addCashSale: (amount: number) => void;
    addCashRefund: (amount: number) => void;
    addPettyCash: (amount: number) => void;
    removePettyCash: (amount: number) => void;
    
    // Getters
    isClockedIn: () => boolean;
}

export const useShiftStore = create<ShiftState>()(
    persist(
        (set, get) => ({
            shifts: [],
            currentShift: null,

            clockIn: (user, startingCash) => {
                if (get().currentShift) return; // Already clocked in

                const newShift: Shift = {
                    id: Date.now().toString(),
                    userId: user.id,
                    userName: user.name,
                    startTime: new Date().toISOString(),
                    status: 'ACTIVE',
                    drawerInfo: {
                        startingCash,
                        cashSales: 0,
                        cashRefunds: 0,
                        cashAdded: 0,
                        cashRemoved: 0,
                        expectedEndingCash: startingCash,
                    },
                };

                set((state) => ({
                    currentShift: newShift,
                    shifts: [newShift, ...state.shifts],
                }));
            },

            clockOut: (actualCash, notes = '') => {
                const shift = get().currentShift;
                if (!shift) return;

                const drawer = shift.drawerInfo;
                const expectedEndingCash = drawer.startingCash + drawer.cashSales - drawer.cashRefunds + drawer.cashAdded - drawer.cashRemoved;
                const difference = actualCash - expectedEndingCash;

                const completedShift: Shift = {
                    ...shift,
                    endTime: new Date().toISOString(),
                    status: 'CLOSED',
                    notes,
                    drawerInfo: {
                        ...drawer,
                        expectedEndingCash,
                        actualEndingCash: actualCash,
                        difference,
                    },
                };

                set((state) => ({
                    currentShift: null,
                    shifts: state.shifts.map((s) => (s.id === shift.id ? completedShift : s)),
                }));
            },

            addCashSale: (amount) => {
                const shift = get().currentShift;
                if (!shift) return;

                set((state) => ({
                    currentShift: {
                        ...shift,
                        drawerInfo: {
                            ...shift.drawerInfo,
                            cashSales: shift.drawerInfo.cashSales + amount,
                        },
                    },
                    shifts: state.shifts.map((s) =>
                        s.id === shift.id
                            ? {
                                  ...s,
                                  drawerInfo: { ...s.drawerInfo, cashSales: s.drawerInfo.cashSales + amount },
                              }
                            : s
                    ),
                }));
            },

            addCashRefund: (amount) => {
                const shift = get().currentShift;
                if (!shift) return;

                set((state) => ({
                    currentShift: {
                        ...shift,
                        drawerInfo: {
                            ...shift.drawerInfo,
                            cashRefunds: shift.drawerInfo.cashRefunds + amount,
                        },
                    },
                    shifts: state.shifts.map((s) =>
                        s.id === shift.id
                            ? {
                                  ...s,
                                  drawerInfo: { ...s.drawerInfo, cashRefunds: s.drawerInfo.cashRefunds + amount },
                              }
                            : s
                    ),
                }));
            },

            addPettyCash: (amount) => {
                const shift = get().currentShift;
                if (!shift) return;

                set((state) => ({
                    currentShift: {
                        ...shift,
                        drawerInfo: {
                            ...shift.drawerInfo,
                            cashAdded: shift.drawerInfo.cashAdded + amount,
                        },
                    },
                    shifts: state.shifts.map((s) =>
                        s.id === shift.id
                            ? {
                                  ...s,
                                  drawerInfo: { ...s.drawerInfo, cashAdded: s.drawerInfo.cashAdded + amount },
                              }
                            : s
                    ),
                }));
            },

            removePettyCash: (amount) => {
                const shift = get().currentShift;
                if (!shift) return;

                set((state) => ({
                    currentShift: {
                        ...shift,
                        drawerInfo: {
                            ...shift.drawerInfo,
                            cashRemoved: shift.drawerInfo.cashRemoved + amount,
                        },
                    },
                    shifts: state.shifts.map((s) =>
                        s.id === shift.id
                            ? {
                                  ...s,
                                  drawerInfo: { ...s.drawerInfo, cashRemoved: s.drawerInfo.cashRemoved + amount },
                              }
                            : s
                    ),
                }));
            },

            isClockedIn: () => !!get().currentShift,
        }),
        {
            name: 'shift-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);