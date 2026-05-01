import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Order } from '../types/order';
import { useOrderStore } from '../store/useOrderStore'; // Import the store

type TimePeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

interface SalesChartProps {
    orders?: Order[]; // Make orders optional
    period?: TimePeriod; // Make period optional
}

// Helper to format labels for the chart
const getLabelsForPeriod = (period: TimePeriod) => {
    const now = new Date();
    if (period === 'TODAY') {
        return ['12am', '6am', '12pm', '6pm', 'Now'];
    }
    if (period === 'THIS_WEEK') {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return labels;
    }
    if (period === 'THIS_MONTH') {
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
    return [];
};

// Helper to process order data for the chart
const processDataForChart = (orders: Order[], period: TimePeriod) => {
    const now = new Date();
    if (period === 'TODAY') {
        const data = [0, 0, 0, 0, 0];
        orders.forEach(order => {
            const hour = new Date(order.date).getHours();
            if (hour < 6) data[0] += order.totalAmount;
            else if (hour < 12) data[1] += order.totalAmount;
            else if (hour < 18) data[2] += order.totalAmount;
            else data[3] += order.totalAmount;
        });
        data[4] = data[0] + data[1] + data[2] + data[3];
        return data;
    }
    if (period === 'THIS_WEEK') {
        const data = Array(7).fill(0);
        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
             if (diffDays >= 0 && diffDays < 7) {
                data[6-diffDays] += order.totalAmount
             }
        });
        return data;
    }
    if (period === 'THIS_MONTH') {
        const data = [0, 0, 0, 0];
        orders.forEach(order => {
            const dayOfMonth = new Date(order.date).getDate();
            if (dayOfMonth <= 7) data[0] += order.totalAmount;
            else if (dayOfMonth <= 14) data[1] += order.totalAmount;
            else if (dayOfMonth <= 21) data[2] += order.totalAmount;
            else data[3] += order.totalAmount;
        });
        return data;
    }
    return [];
};

export const SalesChart = ({ orders: ordersProp, period: periodProp }: SalesChartProps) => {
    // If orders are not passed as a prop, fetch them from the store.
    const ordersFromStore = useOrderStore(state => state.orders);
    const orders = ordersProp || ordersFromStore;
    
    // If period is not passed, default to 'THIS_WEEK'.
    const period = periodProp || 'THIS_WEEK';

    const screenWidth = Dimensions.get('window').width;

    const labels = getLabelsForPeriod(period);
    const data = processDataForChart(orders, period);

    const chartData = {
        labels,
        datasets: [{ data: data.length > 0 ? data : [0] }],
    };
    
    const chartTitle = `Sales Trend (${period.replace('_', ' ')})`;

    return (
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">{chartTitle}</Text>

            <LineChart
                data={chartData}
                width={screenWidth - 60}
                height={220}
                yAxisLabel="৳"
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    fillShadowGradientFrom: "#2563eb",
                    fillShadowGradientFromOpacity: 0.2,
                    fillShadowGradientTo: "#ffffff",
                    fillShadowGradientToOpacity: 0,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#2563eb',
                    },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
                fromZero={true}
            />
        </View>
    );
};