import { BottomTabBarOptions, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Footer, FooterTab, Icon, Text } from 'native-base';
import * as React from 'react';
import useColorScheme from '../hooks/useColorScheme';
import BrickDetailScreen from '../screens/BrickDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ScanScreen from '../screens/ScanScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { BottomTabParamList } from '../types';

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
            <Button
                vertical
                active={props.state.index === 3}
                onPress={() => props.navigation.navigate("BrickDetail",  {brickId: 3001 , images:[]})}>
                <Icon name="star" />
                <Text>Detail</Text>
            </Button>
        </FooterTab>
    </Footer>
)

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator tabBar={footer}>
      <BottomTab.Screen name="History" component={HistoryScreen} />
      <BottomTab.Screen name="Scan" component={ScanScreen} />
      <BottomTab.Screen name="Wishlist" component={WishlistScreen} />
      <BottomTab.Screen name="BrickDetail" component={BrickDetailScreen} />
    </BottomTab.Navigator>
  );
}
