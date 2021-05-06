import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { HistoryParamList } from '../../types';


type BrickDetailScreenRouteProp = StackScreenProps<HistoryParamList, 'BrickDetailScreen'>;

export default function BrickDetailScreen({route, navigation}: BrickDetailScreenRouteProp) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail {route.params.brickId}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/ScanScreen.tsx" />
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
