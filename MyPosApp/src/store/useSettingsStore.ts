import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShopInfo {
    name: string;
    address: string;
    phone: string;
    footerMessage: string;
}

interface SettingsState {
    shopInfo: ShopInfo;
    updateShopInfo: (info: ShopInfo) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            shopInfo: {
                name: "My Awesome Store",
                address: "Dhaka, Bangladesh",
                phone: "+880 1700 000000",
                footerMessage: "Thank you for shopping with us!"
            },
            updateShopInfo: (info) => set({ shopInfo: info }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);