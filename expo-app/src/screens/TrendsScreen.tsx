import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useHealthInsights } from '../hooks/useHealthInsights';
import { LineChart } from 'react-native-chart-kit';
import { subDays, isAfter, parseISO, format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export function TrendsScreen() {
    const navigation = useNavigation();
    const { state } = useApp();
    const { generateInsights, insight, isLoading, error } = useHealthInsights();
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    const filteredBP = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoff = subDays(new Date(), days);
        return [...state.bpReadings]
            .filter(r => isAfter(parseISO(r.timestamp), cutoff))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [state.bpReadings, timeRange]);

    const filteredGlucose = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoff = subDays(new Date(), days);
        return [...state.glucoseReadings]
            .filter(r => isAfter(parseISO(r.timestamp), cutoff))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [state.glucoseReadings, timeRange]);

    useEffect(() => {
        if (filteredBP.length > 0 || filteredGlucose.length > 0) {
            generateInsights(filteredBP, filteredGlucose);
        }
    }, [filteredBP, filteredGlucose, generateInsights]);

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(43, 124, 238, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(76, 108, 154, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#2b7cee',
        },
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Text className="text-2xl">←</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-primary-light">Health Trends</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Time Range Selector */}
                <View className="flex-row bg-white p-1 rounded-xl mb-6 border border-gray-200">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <TouchableOpacity
                            key={range}
                            onPress={() => setTimeRange(range)}
                            className={`flex-1 py-2 rounded-lg items-center ${timeRange === range ? 'bg-primary shadow-sm' : ''
                                }`}
                        >
                            <Text className={`text-sm font-bold ${timeRange === range ? 'text-white' : 'text-text-secondary-light'}`}>
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* AI Insights Card */}
                <View className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Text className="text-xl">✨</Text>
                        <Text className="text-lg font-bold text-text-primary-light">AI Health Insights</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#2b7cee" />
                    ) : error ? (
                        <Text className="text-sm text-red-500 font-medium">{error}</Text>
                    ) : insight ? (
                        <View>
                            <Text className="text-text-primary-light font-medium leading-5 mb-4">
                                {insight.summary}
                            </Text>
                            <View className="mb-4">
                                <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light mb-2">Key Insights</Text>
                                {insight.keyInsights.map((item, i) => (
                                    <View key={i} className="flex-row gap-2 mb-1">
                                        <Text className="text-primary font-bold">•</Text>
                                        <Text className="text-sm text-text-secondary-light flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light mb-2">Actionable Tips</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {insight.tips.map((tip, i) => (
                                        <View key={i} className="bg-white px-3 py-1.5 rounded-full border border-blue-100">
                                            <Text className="text-xs font-bold text-primary">{tip}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ) : (
                        <Text className="text-sm text-text-secondary-light italic">
                            Log more data to unlock AI insights.
                        </Text>
                    )}
                </View>

                {/* BP Chart */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-text-primary-light">Blood Pressure</Text>
                        <Text className="text-xs font-bold text-text-secondary-light uppercase tracking-widest">mmHg</Text>
                    </View>
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 items-center">
                        {filteredBP.length > 1 ? (
                            <LineChart
                                data={{
                                    labels: filteredBP.map(r => format(parseISO(r.timestamp), 'MM/dd')),
                                    datasets: [
                                        {
                                            data: filteredBP.map(r => r.systolic),
                                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for Systolic
                                            strokeWidth: 2
                                        },
                                        {
                                            data: filteredBP.map(r => r.diastolic),
                                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for Diastolic
                                            strokeWidth: 2
                                        }
                                    ],
                                    legend: ['Systolic', 'Diastolic']
                                }}
                                width={screenWidth - 72}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        ) : (
                            <View className="h-40 items-center justify-center">
                                <Text className="text-sm text-text-secondary-light text-center">Not enough data for a trend. Log at least 2 readings.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Glucose Chart */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-text-primary-light">Blood Glucose</Text>
                        <Text className="text-xs font-bold text-text-secondary-light uppercase tracking-widest">mg/dL</Text>
                    </View>
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 items-center">
                        {filteredGlucose.length > 1 ? (
                            <LineChart
                                data={{
                                    labels: filteredGlucose.map(r => format(parseISO(r.timestamp), 'MM/dd')),
                                    datasets: [
                                        {
                                            data: filteredGlucose.map(r => r.value),
                                            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Purple for Glucose
                                            strokeWidth: 2
                                        }
                                    ]
                                }}
                                width={screenWidth - 72}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        ) : (
                            <View className="h-40 items-center justify-center">
                                <Text className="text-sm text-text-secondary-light text-center">Not enough data for a trend. Log at least 2 readings.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
