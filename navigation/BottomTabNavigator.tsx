/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HistoryScreen from '../screens/HistoryScreen';
import ScanScreen from '../screens/ScanScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { BottomTabParamList, HistoryParamList, ScanParamList, WishlistParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Scan"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="History"
        component={HistoryNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="file-tray" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Scan"
        component={ScanNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-camera" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Wishlist"
        component={WishlistNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const HistoryStack = createStackNavigator<HistoryParamList>();

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerTitle: 'History' }}
      />
    </HistoryStack.Navigator>
  );
}

const ScanStack = createStackNavigator<ScanParamList>();

function ScanNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen
        name="ScanScreen"
        component={ScanScreen}
        options={{ headerTitle: 'Scan' }}
      />
    </ScanStack.Navigator>
  );
}

const WishlistStack = createStackNavigator<WishlistParamList>();

function WishlistNavigator() {
  return (
    <WishlistStack.Navigator>
      <WishlistStack.Screen
        name="WishlistScreen"
        component={WishlistScreen}
        options={{ headerTitle: 'Wishlist' }}
      />
    </WishlistStack.Navigator>
  );
}
