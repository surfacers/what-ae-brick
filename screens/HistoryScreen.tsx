import { useMachine } from '@xstate/react';
import { Body, Button, Container, Content, Header, Icon, Left, List, ListItem, Right, Spinner, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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

const Loading = () => (
    // TODO: primary color on Spinner
    <Content contentContainerStyle={ styles.container }>
        <Spinner color="blue" style={styles.container} />
    </Content>
);

const EmptyList = () => (
    <Content contentContainerStyle={ styles.container }>
        <Text style={styles.helpText}>No scanned bricks</Text>
    </Content>
);

const Error = ({ onRetry }: { onRetry: () => void }) => (
    <Content contentContainerStyle={styles.container}>
        <Text style={styles.errorText}>Error while loading</Text>
        <Button style={{ alignSelf: 'center' }} light onPress={onRetry}>
            <Text>Retry</Text>
        </Button>
    </Content>
);

// TODO: Lazy Loading?
const Success = ({ data }: { data: HistoryItem[] }) => (
    <Content>
        <List>
        {data.map(item =>
            <ListItem thumbnail key={item.id}>
                <Left>
                    <Thumbnail square source={{uri: item.uri}} />
                </Left>
                <Body>
                    <Text>{item.brickName}</Text>
                    <Text note numberOfLines={1}>{item.brickId}</Text>
                </Body>
                <Right>
                    <Button transparent>
                        <Text>Details</Text>
                    </Button>
                </Right>
            </ListItem>
        )}
        </List>
    </Content>
);

export default function HistoryScreen() {
    const [state, send, _] = useMachine(dataFetchMachine, {
        services: {
            fetchData: loadData
        }
    });

    useEffect(() => { send({ type: 'FETCH' }) }, [])

    return (
        <Container>
            <Header>
                <Body>
                    <Title>History</Title>
                </Body>
            </Header>

            {
                state.hasTag(DataFetchTag.loading) && state.context.data == null
                    ? <Loading />
                    :
                state.hasTag(DataFetchTag.success) && (state.context.data?.length ?? 0) > 0
                    ? <Success data={state.context.data ?? []} />
                    :
                state.hasTag(DataFetchTag.success)
                    ? <EmptyList />
                    :
                state.hasTag(DataFetchTag.error)
                    ? <Error onRetry={() => send({ type: 'RETRY' })} />
                    : null
            }
        </Container>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    helpText: {
        fontSize: 18,
        color: 'grey'
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 16
    }
});

