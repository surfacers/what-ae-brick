import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { HistoryParamList } from '../types';
import BrickDetailScreen from './BrickDetailScreen';

type historyScreenProp = StackNavigationProp<HistoryParamList, 'HistoryScreen'>;

export default function HistoryScreen() {
  const navigation = useNavigation<historyScreenProp>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/HistoryScreen.tsx" />
      <Button title="Detail" onPress={()=> navigation.navigate('BrickDetailScreen', {brickId:3001, images:[]})}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
