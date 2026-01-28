import {useRouter} from "expo-router";
import {useOrderStore} from "../../store/useOrderStore";
import {Order} from "../../types/order";
import {FlatList, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {pdfService} from "../../services/pdfService";


export default function OrderHistoryScreen() {
    const router = useRouter();
    const { orders } = useOrderStore();

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View className="bg-white dark:bg-slate-900 p-4 mb-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                    <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Ionicons name="receipt-outline" size={18} color="#2563eb" />
                    </View>
                    <View>
                        <Text className="text-slate-800 dark:text-white font-bold">Order #{item.id.slice(-6).toUpperCase()}</Text>
                        <Text className="text-slate-500 text-xs">{new Date(item.date).toDateString()}</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-3">
                    <Text className="text-green-600 font-bold text-lg">৳ {item.totalAmount}</Text>

                    <TouchableOpacity
                        onPress={() => pdfService.printOrder(item)}
                        className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full active:bg-blue-100"
                    >
                        <Ionicons name="print-outline" size={20} color="#2563eb" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg mt-2">
                <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1">Items Summary:</Text>
                <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium" numberOfLines={1}>
                    {item.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                </Text>
            </View>

            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <Text className="text-slate-400 text-xs">{new Date(item.date).toLocaleTimeString()}</Text>
                <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    <Text className="text-green-700 dark:text-green-400 text-xs font-bold">PAID ({item.paymentMethod})</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">

            {/* Header */}
            <View className="flex-row items-center p-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-3 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-800 dark:text-white">Sales History</Text>
                    <Text className="text-slate-500 text-xs">Total Orders: {orders.length}</Text>
                </View>
            </View>

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <Ionicons name="documents-outline" size={60} color="#94a3b8" />
                        <Text className="text-slate-500 mt-4 text-lg">No sales yet!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}