import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import BrickDetailScreen from "../screens/BrickDetailScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { HistoryParamList } from "../types";

const Stack = createStackNavigator<HistoryParamList>();
export function HistoryNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
            <Stack.Screen name="BrickDetailScreen" component={BrickDetailScreen} />
        </Stack.Navigator>
    )
}