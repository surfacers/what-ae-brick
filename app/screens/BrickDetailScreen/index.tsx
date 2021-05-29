import { StackScreenProps } from '@react-navigation/stack';
import { useMachine } from '@xstate/react';
import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Body, Container, Header, Content, Title, } from 'native-base';

import { Error, Loading } from '../../components';
import { BrickInfoContext, brickInfoMachine } from '../../machines/brickInfo.machine';
import { HistoryParamList } from '../../types';
import BrickInfo from './BrickInfo';


type BrickDetailScreenRouteProp = StackScreenProps<HistoryParamList, 'BrickDetailScreen'>;

export default function BrickDetailScreen({ route, navigation }: BrickDetailScreenRouteProp) {
  const [state, send] = useMachine(brickInfoMachine, { context: { partId: route.params.brickId } as BrickInfoContext });
  return <Container >
    <Header>
      <Body>
        <Title>{route.params.brickId}</Title>
      </Body>
    </Header>
    <Content>
      {state.hasTag('loading') ? (
        <Loading />
      ) : state.hasTag('finished') ? (
        <BrickInfo partData={state.context.partData} colorData={state.context.colorData}></BrickInfo>
      ) : (<Error onRetry={() => send('RETRY_LOADING')} />)}
    </Content>
  </Container>
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
