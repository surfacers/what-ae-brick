import { BottomTabBarOptions, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Footer, FooterTab, Icon, Text } from 'native-base';
import * as React from 'react';
import useColorScheme from '../hooks/useColorScheme';
import BrickDetailScreen from '../screens/BrickDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ScanScreen from '../screens/ScanScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { ScanNavigator } from './ScanNavigator';
import { BottomTabParamList, HistoryParamList, WishlistParamList } from '../types';

// https://docs.nativebase.io/docs/examples/navigation/StackNavigationExample.html
const footer = (props: BottomTabBarProps<BottomTabBarOptions>) => (
    <Footer>
        <FooterTab>
            <Button
                vertical
                active={props.state.index === 0}
                onPress={() => props.navigation.navigate("History")}>
                <Icon name="file-tray" />
                <Text>History</Text>
            </Button>
            <Button
                vertical
                active={props.state.index === 1}
                onPress={() => props.navigation.navigate("Scan")}>
                <Icon name="ios-camera" />
                <Text>Scan</Text>
            </Button>
            <Button
                vertical
                active={props.state.index === 2}
                onPress={() => props.navigation.navigate("Wishlist")}>
                <Icon name="star" />
                <Text>Wishlist</Text>
            </Button>
        </FooterTab>
    </Footer>
)

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

const History = createStackNavigator<HistoryParamList>();
function HistoryNavigator() {
    return (
        <History.Navigator screenOptions={{ headerShown: false }}>
            <History.Screen name="HistoryScreen" component={HistoryScreen} />
            <History.Screen name="BrickDetailScreen" component={BrickDetailScreen} />
        </History.Navigator>
    )
}

const Wishlist = createStackNavigator<WishlistParamList>()
function WishlistNavigator() {
    return (
        <Wishlist.Navigator screenOptions={{ headerShown: false }}>
            <Wishlist.Screen name="WishlistScreen" component={WishlistScreen} />
            <Wishlist.Screen name="BrickDetailScreen" component={BrickDetailScreen} />
        </Wishlist.Navigator>
    )
}

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator tabBar={footer} initialRouteName="Scan">
      <BottomTab.Screen name="History" component={HistoryNavigator} />
      <BottomTab.Screen name="Scan" component={ScanNavigator} />
      <BottomTab.Screen name="Wishlist" component={WishlistNavigator} />
    </BottomTab.Navigator>
  );
}
