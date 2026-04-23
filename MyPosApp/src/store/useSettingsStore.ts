import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaxSettings {
    isEnabled: boolean;
    taxRate: number; // e.g. 5, 10, 15 (Percentage)
    taxName: string; // e.g. "VAT", "GST", "Sales Tax"
    isInclusive: boolean; // if true, tax is already included in product price. If false, added on top of subtotal.
}

interface ShopInfo {
    name: string;
    address: string;
    phone: string;
    footerMessage: string;
}

interface SettingsState {
    shopInfo: ShopInfo;
    taxSettings: TaxSettings;
    updateShopInfo: (info: ShopInfo) => void;
    updateTaxSettings: (tax: TaxSettings) => void;
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
            taxSettings: {
                isEnabled: false,
                taxRate: 5,
                taxName: "VAT",
                isInclusive: false,
            },
            updateShopInfo: (info) => set({ shopInfo: info }),
            updateTaxSettings: (tax) => set({ taxSettings: tax }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);