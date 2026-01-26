import "../src/global.css";
import "../src/i18n";
import {Stack} from 'expo-router';
import {useEffect} from "react";
import {useColorScheme} from "nativewind";
import {useAppStore} from "../src/store/useAppStore";

export default function RootLayout() {
    const {theme} = useAppStore();
    const {setColorScheme} = useColorScheme();

    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="dashboard"/>
            <Stack.Screen
                name="productdetails"
                options={{ presentation: 'modal', headerShown: false }}
            />
        </Stack>
    );
}