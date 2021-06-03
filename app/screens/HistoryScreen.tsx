import { useNavigation } from '@react-navigation/core';
import { useMachine } from '@xstate/react';
import { Body, Button, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { Error, List, Loading } from '../components';
import { addPartToFavs, fetchFavs } from '../data/favs.service';
import { fetchHistory, saveToHistory } from '../data/history.service';
import { partImageUrl } from '../data/parts.service';
import { historyMachine, HistoryTag } from '../machines/history.machine';

export default function HistoryScreen() {
    const [state, send, _] = useMachine(historyMachine, {
        services: {
            fetchData: () => new Promise(async (resolve, reject) => {
                try {
                    const history = await fetchHistory()
                    const favs = await fetchFavs()
                    resolve({ history, favs })
                } catch (error) {
                    reject(error)
                }
            }),
            saveHistory: (_, event: any) => saveToHistory(event.partId),
            saveFavs: (context, event: any) => addPartToFavs(context.favs, event.partId)
        }
    })
    useEffect(() => { send({ type: 'FETCH' }) }, [])

    const navigation = useNavigation()
    const navigateToDetails = (partId: string) =>
        navigation.navigate("BrickDetailScreen",  { partId: partId })

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            send({ type: 'RETRY' })
        });

        return unsubscribe;
        }, [navigation]);

    const addToFavs = (partId: string) =>
        send({ type: 'UPDATE_FAV', partId })

    return <Container>
        <Header>
            <Body>
                <Title>History</Title>
            </Body>
        </Header>{
            state.hasTag(HistoryTag.success)
                ? <List data={state.context.parts ?? []}
                        keyExtractor={item => item.id}
                        emptyText="No parts scanned"
                        loading={state.hasTag(HistoryTag.loading)}
                        reload={() => send({ type: 'RETRY' })}
                        renderItem={({ item }) => (
                            <ListItem thumbnail key={item.id} onPress={() => navigateToDetails(item.partId)}>
                                <Left>
                                    <Thumbnail square source={{uri: partImageUrl(item.partId) }} />
                                </Left>
                                <Body>
                                    <Text>{item.partName}</Text>
                                    <Text note numberOfLines={1}>{item.partId}</Text>
                                </Body>
                                <Right>
                                    <Button transparent
                                            onPress={() => addToFavs(item.partId)}
                                            disabled={state.hasTag(HistoryTag.saving)}>
                                        <Icon name={ state.context.favs.has(item.partId) ? 'star' : 'star-outline' }/>
                                    </Button>
                                </Right>
                            </ListItem>
                        )}/>
                :
            state.hasTag(HistoryTag.loading)
                ? <Loading />
                :
            state.hasTag(HistoryTag.error)
                ? <Error onRetry={() => send({ type: 'RETRY' })} />
                : null
        }</Container>
}