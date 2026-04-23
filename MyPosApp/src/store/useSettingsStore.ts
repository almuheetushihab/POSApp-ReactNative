import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaxSettings {
    isEnabled: boolean;
    taxRate: number; // e.g. 5, 10, 15 (Percentage)
    taxName: string; // e.g. "VAT", "GST", "Sales Tax"
    isInclusive: boolean; // if true, tax is already included in product price. If false, added on top of subtotal.
}

export interface LoyaltySettings {
    isEnabled: boolean;
    pointsPerTaka: number; // How many points earned per Taka spent (e.g., 0.1 means 1 point for every 10 Taka)
    takaPerPoint: number;  // How many Taka is 1 point worth for redemption (e.g., 1 means 1 point = 1 Taka discount)
    minimumPointsToRedeem: number; // Minimum points a customer must have to be able to redeem
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
    loyaltySettings: LoyaltySettings;
    updateShopInfo: (info: ShopInfo) => void;
    updateTaxSettings: (tax: TaxSettings) => void;
    updateLoyaltySettings: (loyalty: LoyaltySettings) => void;
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
            loyaltySettings: {
                isEnabled: true,
                pointsPerTaka: 0.1, // 1 point for every 10 Taka
                takaPerPoint: 1,    // 1 point = 1 Taka
                minimumPointsToRedeem: 100,
            },
            updateShopInfo: (info) => set({ shopInfo: info }),
            updateTaxSettings: (tax) => set({ taxSettings: tax }),
            updateLoyaltySettings: (loyalty) => set({ loyaltySettings: loyalty }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);