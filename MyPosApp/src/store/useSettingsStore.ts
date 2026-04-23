import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaxSettings {
    isEnabled: boolean;
    taxRate: number;
    taxName: string;
    isInclusive: boolean;
}

export interface LoyaltySettings {
    isEnabled: boolean;
    pointsPerTaka: number;
    takaPerPoint: number;
    minimumPointsToRedeem: number;
}

export interface Store {
    id: string;
    name: string;
    address: string;
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
    stores: Store[];
    activeStoreId: string;
    updateShopInfo: (info: ShopInfo) => void;
    updateTaxSettings: (tax: TaxSettings) => void;
    updateLoyaltySettings: (loyalty: LoyaltySettings) => void;
    setActiveStore: (storeId: string) => void;
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
                pointsPerTaka: 0.1,
                takaPerPoint: 1,
                minimumPointsToRedeem: 100,
            },
            stores: [
                { id: 'store_1', name: 'Dhaka Branch', address: 'Gulshan, Dhaka' },
                { id: 'store_2', name: 'Chittagong Branch', address: 'Agrabad, Chittagong' },
            ],
            activeStoreId: 'store_1', // Default to the first store
            updateShopInfo: (info) => set({ shopInfo: info }),
            updateTaxSettings: (tax) => set({ taxSettings: tax }),
            updateLoyaltySettings: (loyalty) => set({ loyaltySettings: loyalty }),
            setActiveStore: (storeId) => set({ activeStoreId: storeId }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);