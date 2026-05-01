import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types/order';
import { SalesChart } from '../../components/SalesChart'; // Import the chart

export type TimePeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

// Helper function to filter orders based on the selected time period
const filterOrdersByPeriod = (orders: Order[], period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
        case 'TODAY':
            return orders.filter(order => new Date(order.date) >= today);
        
        case 'THIS_WEEK':
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Assuming Sunday is the first day
            return orders.filter(order => new Date(order.date) >= firstDayOfWeek);

        case 'THIS_MONTH':
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return orders.filter(order => new Date(order.date) >= firstDayOfMonth);
            
        default:
            return orders;
    }
};

// A card component to show key metrics
const SummaryCard = ({ title, value, icon, color }: { title: string, value: string, icon: keyof typeof Ionicons.glyphMap, color: string }) => (
    <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color}`}>
            <Ionicons name={icon} size={22} color="white" />
        </View>
        <Text className="text-slate-500 dark:text-slate-400 text-sm font-bold">{title}</Text>
        <Text className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{value}</Text>
    </View>
);

export default function ReportScreen() {
    const { orders } = useOrderStore();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('TODAY');

    // Memoize the filtered orders and calculations for performance
    const reportData = useMemo(() => {
        const filtered = filterOrdersByPeriod(orders, timePeriod);
        
        const totalRevenue = filtered.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = filtered.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            filteredOrders: filtered,
        };
    }, [orders, timePeriod]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Sales Report</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Time Period Filter */}
                <View className="flex-row bg-gray-200 dark:bg-slate-800 p-1 rounded-full mb-6">
                    {(['TODAY', 'THIS_WEEK', 'THIS_MONTH'] as TimePeriod[]).map(period => (
                        <TouchableOpacity
                            key={period}
                            onPress={() => setTimePeriod(period)}
                            className={`flex-1 py-2 rounded-full ${timePeriod === period ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                        >
                            <Text className={`text-center font-bold ${timePeriod === period ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>
                                {period.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary Cards */}
                <View className="flex-row gap-4 mb-6">
                    <SummaryCard title="Total Revenue" value={`৳${reportData.totalRevenue.toFixed(0)}`} icon="cash-outline" color="bg-green-500" />
                    <SummaryCard title="Total Orders" value={reportData.totalOrders.toString()} icon="receipt-outline" color="bg-blue-500" />
                </View>
                <View className="mb-6">
                    <SummaryCard title="Average Order Value" value={`৳${reportData.averageOrderValue.toFixed(0)}`} icon="analytics-outline" color="bg-purple-500" />
                </View>

                {/* Sales Chart */}
                <SalesChart orders={reportData.filteredOrders} period={timePeriod} />

            </ScrollView>
        </SafeAreaView>
    );
}
