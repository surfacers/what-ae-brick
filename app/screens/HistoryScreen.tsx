import { useNavigation } from '@react-navigation/core';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useMachine } from '@xstate/react';
import { Body, Button, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Error, List, Loading } from '../components';
import { addPartToFavs, fetchFavs } from '../data/favs.service';
import { fetchHistory, saveToHistory } from '../data/history.service';
import { allParts } from '../data/parts.data';
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

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            send({ type: 'RETRY' })
        });

        return unsubscribe;
        }, [navigation]);

    const addToHistory = () => {
        // TODO: for testing random
        const partId = allParts[Math.floor(Math.random() * allParts.length)].id
        send({ type: 'UPDATE_HISTORY', partId })
    }
    const addToFavs = (partId: string) =>
        send({ type: 'UPDATE_FAV', partId })

    return <Container>
        <Header>
            <Body>
                <Title>History</Title>
            </Body>
            <Right>
                <Button transparent onPress={addToHistory}>
                    <Text>Add</Text>
                </Button>
            </Right>
        </Header>{
            state.hasTag(HistoryTag.success)
                ? <List data={state.context.parts ?? []}
                        keyExtractor={item => item.id}
                        loading={state.hasTag(HistoryTag.loading)}
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
