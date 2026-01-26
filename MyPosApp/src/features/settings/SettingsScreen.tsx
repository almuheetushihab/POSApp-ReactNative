import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useAppStore} from "../../store/useAppStore";
import {useTranslation} from "react-i18next";


export default function SettingsScreen() {
    const {t} = useTranslation();
    const {language, setLanguage, theme, setTheme} = useAppStore();

    return (
        <View className="flex-1 justify-center items-center bg-white dark:bg-slate-900">
            <Text className="text-2xl font-bold mb-10 text-black dark:text-white">
                {t('settings')}
            </Text>

            <View className="mb-8">
                <Text className="text-lg mb-2 text-gray-600 dark:text-gray-300">{t('language')}</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => setLanguage('en')}
                        className={`p-3 rounded-lg ${language === 'en' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <Text className={language === 'en' ? 'text-white' : 'text-black'}>English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setLanguage('bn')}
                        className={`p-3 rounded-lg ${language === 'bn' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <Text className={language === 'bn' ? 'text-white' : 'text-black'}>বাংলা</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                <Text className="text-lg mb-2 text-gray-600 dark:text-gray-300">{t('theme')}</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => setTheme('light')}
                        className={`p-3 rounded-lg ${theme === 'light' ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                        <Text className={theme === 'light' ? 'text-white' : 'text-black'}>{t('light_mode')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setTheme('dark')}
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                        <Text className={theme === 'dark' ? 'text-white' : 'text-black'}>{t('dark_mode')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}