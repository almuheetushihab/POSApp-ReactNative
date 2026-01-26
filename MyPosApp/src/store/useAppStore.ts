import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

interface AppState {
    language: 'en' | 'bn';
    theme: 'light' | 'dark' | 'system';
    setLanguage: (lang: 'en' | 'bn') => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: 'en',
            theme: 'system',

            setLanguage: async (lang) => {
                await i18n.changeLanguage(lang);
                set({ language: lang });
            },

            setTheme: (theme) => {
                set({ theme });
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);