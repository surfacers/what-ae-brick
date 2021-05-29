import { useMachine } from '@xstate/react';
import { Body, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { Error, List, Loading } from '../components';
import createDataFetchMachine, { DataFetchTag } from '../machines/data-fetch.machine';

interface HistoryItem {
    id: string,
    brickId: string,
    brickName: string,
    uri: string,
    timeStamp: Date
}

const dataFetchMachine = createDataFetchMachine<HistoryItem>();
// TODO: Load from SQLLite Database
const loadData = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        const bricks = [
            { id: '3001', name: 'Brick 2 x 4' },
            { id: '3002', name: 'Brick 2 x 2' },
            { id: '3003', name: 'Brick 2 x 2' },
        ]

        const data: HistoryItem[] = bricks.map((brick, i) => {
            return {
                id: `${i}`,
                brickId: brick.id,
                brickName: brick.name,
                uri: `https://cdn.rebrickable.com/media/thumbs/parts/ldraw/4/${brick.id}.png/230x230.png`,
                timeStamp: new Date()
            }
        })

        resolve(data)
        // resolve([])
        // reject('No internet connection')
    }, 1000)
});

export default function HistoryScreen() {
    const [state, send, _] = useMachine(dataFetchMachine, {
        services: {
            fetchData: loadData
        }
    });

    useEffect(() => { send({ type: 'FETCH' }) }, [])

    const favs = ['3001', '3002', '3003'] // TODO:

    return (
        <Container>
            <Header>
                <Body>
                    <Title>Wishlist</Title>
                </Body>
            </Header>
            {
                state.hasTag(DataFetchTag.success)
                    ? <List data={state.context.data ?? []}
                        keyExtractor={item => item.id}
                        loading={state.hasTag(DataFetchTag.loading)}
                        reload={() => send({ type: 'RETRY' })}
                        renderItem={({ item }) => (
                            <ListItem thumbnail key={item.id}>
                            <Left>
                                <Thumbnail square source={{uri: item.uri}} />
                            </Left>
                            <Body>
                                <Text>{item.brickName}</Text>
                                <Text note numberOfLines={1}>{item.brickId}</Text>
                            </Body>
                            <Right>
                                <Icon name={ favs.includes(item.brickId) ? 'star' : 'star-outline' }
                                    style={{ color: 'blue' }} />
                            </Right>
                        </ListItem>)} />
                    :
                state.hasTag(DataFetchTag.loading)
                    ? <Loading />
                    :
                state.hasTag(DataFetchTag.error)
                    ? <Error onRetry={() => send({ type: 'RETRY' })} />
                    : null
            }
        </Container>);
}

