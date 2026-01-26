import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './en.json';
import bn from './bn.json';

const resources = {
    en: {translation: en},
    bn: {translation: bn},
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem('language');

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()[0].languageCode === 'bn' ? 'bn' : 'en';
    }

    i18n.use(initReactI18next).init({
        compatibilityJSON: 'v4',
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });
};

initI18n();

export default i18n;