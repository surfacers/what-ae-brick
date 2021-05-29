import { useNavigation } from '@react-navigation/core';
import { useMachine } from '@xstate/react';
import { Body, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Error, List, Loading } from '../components';
import createDataFetchMachine, { DataFetchTag } from '../machines/data-fetch.machine';

interface HistoryItem {
    id: string,
    brickId: string,
    brickName: string,
    uri: string,
    timeStamp: Date
}

function random(max: number) {
    return Math.floor(Math.random() * max);
}

const dataFetchMachine = createDataFetchMachine<HistoryItem>();
// TODO: Load from SQLLite Database
const loadData = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        const bricks = [
            { id: '3001', name: 'Brick 2 x 4', colors: [13, 14, 18, 22, 25] },
            { id: '3002', name: 'Brick 2 x 2', colors: [4, 15, 27] },
            { id: '3003', name: 'Brick 2 x 2', colors: [4, 15, 27] },
            { id: '3005', name: 'Brick 1 x 1', colors: [4, 15, 25, 27, 322] },
            { id: '3666', name: 'Plate 1 x 6', colors: [4, 15, 25, 27, 322] },
            { id: '60479', name: 'Plate 1 x 12', colors: [0, 4, 15] },
        ]

        const data: HistoryItem[] = [...new Array(30)].map((_, i) => {
            const brick = bricks[random(bricks.length)]
            const color = brick.colors[random(brick.colors.length)];
            return {
                id: `${i}`,
                brickId: brick.id,
                brickName: brick.name,
                uri: `https://cdn.rebrickable.com/media/thumbs/parts/ldraw/${color}/${brick.id}.png/230x230.png`,
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

    const favs = ['3001'] // TODO:

    const navigation = useNavigation();

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
                            <TouchableHighlight onPress={() => navigation.navigate("BrickDetailScreen",  {brickId: item.brickId , images:[]})}>
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
                            </ListItem>
                        </TouchableHighlight>)} />
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
