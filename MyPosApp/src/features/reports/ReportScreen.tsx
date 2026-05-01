import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types/order';
import { SalesChart } from '../../components/SalesChart';

export type TimePeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

const filterOrdersByPeriod = (orders: Order[], period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
        case 'TODAY':
            return orders.filter(order => new Date(order.date) >= today);
        
        case 'THIS_WEEK':
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay());
            return orders.filter(order => new Date(order.date) >= firstDayOfWeek);

        case 'THIS_MONTH':
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return orders.filter(order => new Date(order.date) >= firstDayOfMonth);
            
        default:
            return orders;
    }
};

const SummaryCard = ({ title, value, icon, color, subtitle }: { title: string, value: string, icon: keyof typeof Ionicons.glyphMap, color: string, subtitle?: string }) => (
    <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color}`}>
            <Ionicons name={icon} size={22} color="white" />
        </View>
        <Text className="text-slate-500 dark:text-slate-400 text-sm font-bold">{title}</Text>
        <Text className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{value}</Text>
        {subtitle && <Text className="text-xs text-slate-400 mt-1">{subtitle}</Text>}
    </View>
);

const ProductReportRow = ({ rank, name, quantity, revenue }: { rank: number, name: string, quantity: number, revenue: number }) => (
    <View className="flex-row items-center bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg mb-2">
        <Text className="w-8 text-slate-500 font-bold">{rank}.</Text>
        <View className="flex-1">
            <Text className="text-slate-800 dark:text-white font-bold" numberOfLines={1}>{name}</Text>
            <Text className="text-blue-500 text-xs font-medium">Revenue: ৳{revenue.toFixed(0)}</Text>
        </View>
        <Text className="text-slate-600 dark:text-slate-300 font-bold">Sold: {quantity}</Text>
    </View>
);

export default function ReportScreen() {
    const { orders } = useOrderStore();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('TODAY');

    const reportData = useMemo(() => {
        const filtered = filterOrdersByPeriod(orders, timePeriod);
        
        const totalRevenue = filtered.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = filtered.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // --- Profit Calculation ---
        const totalCost = filtered.reduce((orderSum, order) => {
            const orderCost = order.items.reduce((itemSum, item) => {
                // Use purchasePrice if available, otherwise fall back to 70% of sale price as an estimate
                const cost = item.purchasePrice || item.price * 0.7; 
                return itemSum + (cost * item.quantity);
            }, 0);
            return orderSum + orderCost;
        }, 0);
        
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        // --- End of Profit Calculation ---

        const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
        filtered.forEach(order => {
            order.items.forEach(item => {
                if (productSales[item.id]) {
                    productSales[item.id].quantity += item.quantity;
                    productSales[item.id].revenue += item.price * item.quantity;
                } else {
                    productSales[item.id] = {
                        name: item.name,
                        quantity: item.quantity,
                        revenue: item.price * item.quantity,
                    };
                }
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            totalProfit,
            profitMargin,
            topProducts,
            filteredOrders: filtered,
        };
    }, [orders, timePeriod]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                <Text className="text-2xl font-bold text-slate-800 dark:text-white">Sales & Profit Report</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="flex-row bg-gray-200 dark:bg-slate-800 p-1 rounded-full mb-6">
                    {(['TODAY', 'THIS_WEEK', 'THIS_MONTH'] as TimePeriod[]).map(period => (
                        <Pressable
                            key={period}
                            onPress={() => setTimePeriod(period)}
                            className={`flex-1 py-2 rounded-full ${timePeriod === period ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                        >
                            <Text className={`text-center font-bold ${timePeriod === period ? 'text-blue-600 dark:text-white' : 'text-slate-500'}`}>
                                {period.replace('_', ' ')}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View className="flex-row gap-4 mb-6">
                    <SummaryCard title="Total Revenue" value={`৳${reportData.totalRevenue.toFixed(0)}`} icon="cash-outline" color="bg-green-500" />
                    <SummaryCard title="Total Profit" value={`৳${reportData.totalProfit.toFixed(0)}`} icon="trending-up-outline" color="bg-sky-500" subtitle={`Margin: ${reportData.profitMargin.toFixed(1)}%`} />
                </View>
                <View className="flex-row gap-4 mb-6">
                    <SummaryCard title="Total Orders" value={reportData.totalOrders.toString()} icon="receipt-outline" color="bg-blue-500" />
                    <SummaryCard title="Avg. Order Value" value={`৳${reportData.averageOrderValue.toFixed(0)}`} icon="analytics-outline" color="bg-purple-500" />
                </View>

                <SalesChart orders={reportData.filteredOrders} period={timePeriod} />

                <View className="mt-6">
                    <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">Top Selling Products</Text>
                    {reportData.topProducts.length > 0 ? (
                        reportData.topProducts.map((product, index) => (
                            <ProductReportRow
                                key={product.name}
                                rank={index + 1}
                                name={product.name}
                                quantity={product.quantity}
                                revenue={product.revenue}
                            />
                        ))
                    ) : (
                        <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl items-center">
                            <Ionicons name="sad-outline" size={40} color="#94a3b8" />
                            <Text className="text-slate-500 mt-2">No sales data for this period.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}