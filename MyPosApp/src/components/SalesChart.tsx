import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {useOrderStore} from '../store/useOrderStore';

export const SalesChart = () => {
    const {orders} = useOrderStore();
    const screenWidth = Dimensions.get("window").width;

    const getLast7DaysData = () => {
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toDateString();

            labels.push(d.toLocaleDateString('en-US', {weekday: 'short'}));

            const daysTotal = orders
                .filter(o => new Date(o.date).toDateString() === dateString)
                .reduce((sum, o) => sum + o.totalAmount, 0);

            data.push(daysTotal);
        }

        return {labels, data};
    };

    const chartData = getLast7DaysData();

    return (
        <View
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">Sales Trend (Last 7 Days)</Text>

            <LineChart
                data={{
                    labels: chartData.labels,
                    datasets: [{data: chartData.data}]
                }}
                width={screenWidth - 60}
                height={220}
                yAxisLabel="৳"
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    fillShadowGradientFrom: "#2563eb",
                    fillShadowGradientTo: "#2563eb",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                    style: {borderRadius: 16},
                    propsForDots: {
                        r: "5",
                        strokeWidth: "2",
                        stroke: "#2563eb"
                    }
                }}
                bezier
                style={{marginVertical: 8, borderRadius: 16}}
            />
        </View>
    );
};