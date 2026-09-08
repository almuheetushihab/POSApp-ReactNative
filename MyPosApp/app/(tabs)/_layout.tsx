import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { bottom } = useSafeAreaInsets();

    let Colors = {
        light: {
            tint: '#2563EB',
        },
        dark: {
            tint: '#3B82F6',
        },
    };
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.tint ?? '#2563EB',
                tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
                tabBarStyle: {
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderTopColor: isDark ? '#1F2937' : '#E5E7EB',
                    borderTopWidth: 1,
                    height: 60 + bottom,
                    paddingTop: 6,
                    paddingBottom: bottom > 0 ? bottom : 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            {/* Visible tabs (max 4) */}
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pos"
                options={{
                    title: 'Sale',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Items',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
                    ),
                }}
            />
            {/* Hidden from tab bar, still navigable via router.push() */}
            <Tabs.Screen
                name="reports"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}