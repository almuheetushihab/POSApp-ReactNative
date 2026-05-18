import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Branch } from '../types/branch';

interface BranchState {
    branches: Branch[];
    selectedBranch: Branch | null;
    setBranches: (branches: Branch[]) => void;
    selectBranch: (branch: Branch) => void;
}

const MOCK_BRANCHES: Branch[] = [
    { id: '1', name: 'Main Branch', address: '123 Main St, Dhaka' },
    { id: '2', name: 'Second Branch', address: '456 Second St, Chittagong' },
];

export const useBranchStore = create<BranchState>()(
    persist(
        (set) => ({
            branches: MOCK_BRANCHES,
            selectedBranch: null,

            setBranches: (branches) => set({ branches }),
            selectBranch: (branch) => set({ selectedBranch: branch }),
        }),
        {
            name: 'branch-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
