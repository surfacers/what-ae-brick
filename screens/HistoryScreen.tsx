import { useMachine } from '@xstate/react';
import { Body, Button, Container, Content, Header, Left, ListItem, Right, Spinner, Text, Thumbnail, Title, View } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Image } from 'react-native';
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

// TODO: primary color on Spinner
const Loading = () => (
    <View style={ styles.container }>
        <Spinner color="blue" style={styles.container} />
    </View>
);

const Error = ({ onRetry }: { onRetry: () => void }) => (
    <Content contentContainerStyle={styles.container}>
        <Image style={ styles.image } source={require('../assets/images/error.png')}></Image>
        <Text style={styles.errorText}>Error while loading</Text>
        <Button style={{ alignSelf: 'center' }} light onPress={onRetry}>
            <Text>Retry</Text>
        </Button>
    </Content>
);

const Success = ({ data, loading, reload }: { data: HistoryItem[], loading: boolean, reload: () => void }) => (
    <View  style={{flex: 1}}>
        <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={reload} />}
            ListEmptyComponent={
                <View style={styles.container}>
                    <Image style={ styles.image } source={require('../assets/images/empty.png')}></Image>
                    <Text style={styles.helpText}>No scanned bricks</Text>
                </View>
            }
            data={data}
            keyExtractor={item => item.id}
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
                    <Button transparent>
                        <Text>Details</Text>
                    </Button>
                </Right>
            </ListItem>)}>
        </FlatList>
    </View>
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
                state.hasTag(DataFetchTag.success)
                    ? <Success data={state.context.data ?? []}
                        loading={state.hasTag(DataFetchTag.loading)}
                        reload={() => send({ type: 'RETRY' })} />
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

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    helpText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'grey'
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 16
    },
    image: {
        resizeMode: 'contain',
        width: 300,
        height: 300
    }
});

