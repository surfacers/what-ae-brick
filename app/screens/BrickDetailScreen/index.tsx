import { StackScreenProps } from '@react-navigation/stack';
import { useMachine } from '@xstate/react';
import * as React from 'react';

import { Body, Container, Header, Content, Title, } from 'native-base';

import { Error, Loading } from '../../components';
import { BrickInfoContext, brickInfoMachine } from '../../machines/brickInfo.machine';
import { HistoryParamList } from '../../types';
import BrickDetailView from './BrickDetailView';


type BrickDetailScreenRouteProp = StackScreenProps<HistoryParamList, 'BrickDetailScreen'>;

export default function BrickDetailScreen({ route, navigation }: BrickDetailScreenRouteProp) {
    const [state, send] = useMachine(brickInfoMachine, {
        context: {
            partId: route.params.partId
        }
    });

    return <Container >
        <Header>
            <Body>
                <Title>{route.params.partId}</Title>
            </Body>
        </Header>
        <Content>{
            state.hasTag('loading')
                ? <Loading />
                :
            state.hasTag('finished')
                ? <BrickDetailView
                    part={state.context.part}
                    partColors={state.context.partColors} />
                : <Error onRetry={() => send('RETRY_LOADING')} />
        }
        </Content>
    </Container>
}
