import { useNavigation } from '@react-navigation/core';
import { useMachine } from '@xstate/react';
import { Body, Button, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Error, List, Loading } from '../components';
import { fetchHistory, HistoryItem, fetchFavs, saveFavs } from '../data/data-service';
import { historyFetchMachine, HistoryFetchTag } from '../machines/history.machine';

export default function WishlistScreen() {
    const navigation = useNavigation(); // TODO: make it typesafe?
    const [state, send, _] = useMachine(historyFetchMachine, {
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
            saveFavs: (context, event) => new Promise<Set<string>>(async (resolve, reject) => {
                if (event.type === 'UPDATE_FAV') {
                    try {
                        let newFavs = new Set(context.favs)
                        if (newFavs.has(event.partId)) {
                            newFavs.delete(event.partId)
                        } else {
                            newFavs.add(event.partId)
                        }

                        newFavs = await saveFavs(newFavs)
                        resolve(newFavs)
                    } catch (error) {
                        reject(error)
                    }
                }
            })
        }
    })
    useEffect(() => {
        send({ type: 'FETCH' })
    }, [])

    const navigateToDetails = (partId: string) =>
        navigation.navigate("BrickDetailScreen",  { partId: partId })

    const addToFavs = (partId: string) => send({ type: 'UPDATE_FAV', partId })

    return <Container>
        <Header>
            <Body>
                <Title>Wishlist</Title>
            </Body>
        </Header>{
            state.hasTag(HistoryFetchTag.success)
                ? <List data={state.context.history ?? []}
                        keyExtractor={item => item.id}
                        loading={state.hasTag(HistoryFetchTag.loading)}
                        reload={() => send({ type: 'RETRY' })}
                        renderItem={({ item }) => (
                            <ListItem thumbnail key={item.id} onPress={() => navigateToDetails(item.partId)}>
                                <Left>
                                    <Thumbnail square source={{uri: item.uri}} />
                                </Left>
                                <Body>
                                    <Text>{item.partName}</Text>
                                    <Text note numberOfLines={1}>{item.partId}</Text>
                                </Body>
                                <Right>
                                    <Button transparent
                                            onPress={() => addToFavs(item.partId)}
                                            disabled={state.hasTag(HistoryFetchTag.saving)}>
                                        <Icon name={ state.context.favs.has(item.partId) ? 'star' : 'star-outline' }/>
                                    </Button>
                                </Right>
                            </ListItem>
                        )}/>
                :
            state.hasTag(HistoryFetchTag.loading)
                ? <Loading />
                :
            state.hasTag(HistoryFetchTag.error)
                ? <Error onRetry={() => send({ type: 'RETRY' })} />
                : null
        }</Container>
}
