import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useApp } from '../context/AppContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { CreateProfileScreen } from '../screens/CreateProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { QuickAddScreen } from '../screens/QuickAddScreen';
import { BPEntryScreen } from '../screens/BPEntryScreen';
import { GlucoseEntryScreen } from '../screens/GlucoseEntryScreen';
import { SymptomEntryScreen } from '../screens/SymptomEntryScreen';
import { TrendsScreen } from '../screens/TrendsScreen';
import { NotificationScreen } from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        History: '📊',
        Documents: '📄',
        Profile: '👤',
    };
    return (
        <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
            {icons[name] || '•'}
        </Text>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
                tabBarActiveTintColor: '#2b7cee',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Documents" component={DocumentsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export function RootNavigator() {
    const { state } = useApp();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!state.isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : state.profiles.length === 0 ? (
                    <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="QuickAdd" component={QuickAddScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="BPEntry" component={BPEntryScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="GlucoseEntry" component={GlucoseEntryScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="SymptomEntry" component={SymptomEntryScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="Trends" component={TrendsScreen} />
                        <Stack.Screen name="Notifications" component={NotificationScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
