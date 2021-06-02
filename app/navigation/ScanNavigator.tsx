import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import BrickDetailScreen from "../screens/BrickDetailScreen";
import { ScanParamList } from "../types";
import ScanScreen from "../screens/ScanScreen";

const Stack = createStackNavigator<ScanParamList>();
export function ScanNavigator(){
    return(
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ScanScreen" component={ScanScreen} />
        <Stack.Screen name="BrickDetailScreen" component={BrickDetailScreen} />
      </Stack.Navigator>
    )
  }