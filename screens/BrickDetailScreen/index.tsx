import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useMachine } from '@xstate/react';
import * as React from 'react';
import { ActivityIndicator, StyleSheet, Image } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { BrickInfoContext, brickInfoMachine } from '../../machines/brickInfo.machine';
import { HistoryParamList } from '../../types';
import BrickInfo from './BrickInfo';


type BrickDetailScreenRouteProp = StackScreenProps<HistoryParamList, 'BrickDetailScreen'>;

export default function BrickDetailScreen({route, navigation}: BrickDetailScreenRouteProp) {
    const [state, _] = useMachine(brickInfoMachine,{context: {partId:route.params.brickId} as BrickInfoContext});
  return state.hasTag('loading') ? (  
    <ActivityIndicator />
    ) : state.hasTag('finished') ? (
      <BrickInfo partData={state.context.partData} colorData={state.context.colorData}></BrickInfo>
  ) : (<Text>ERROR</Text>);
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  image: {
    width: 250,
    height: 250,
  }
});
