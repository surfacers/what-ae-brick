import { useNavigation } from '@react-navigation/core';
import { useMachine } from '@xstate/react';
import { Body, Button, Container, Header, Icon, Left, ListItem, Right, Text, Thumbnail, Title } from 'native-base';
import * as React from 'react';
import { useEffect } from 'react';
import { Error, List, Loading } from '../components';
import { addPartToFavs } from '../data/favs.service';
import { fetchWishlist } from '../data/wishlist.service';
import { wishlistMachine, WishlistTag } from '../machines/wishlist.machine';

export default function WishlistScreen() {
    const [state, send, _] = useMachine(wishlistMachine, {
        services: {
            fetchData: () => fetchWishlist,
            saveFavs: (context, event: any) => addPartToFavs(context.favs, event.partId)
        }
    })

    useEffect(() => { send({ type: 'FETCH' }) }, [])

    const navigation = useNavigation()
    const navigateToDetails = (partId: string) =>
        navigation.navigate('BrickDetailScreen',  { partId: partId })

    React.useEffect(() => {
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
                <Title>Wishlist</Title>
            </Body>
        </Header>{
            state.hasTag(WishlistTag.success)
                ? <List data={state.context.items ?? []}
                        keyExtractor={item => item.id}
                        loading={state.hasTag(WishlistTag.loading)}
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
                                            disabled={state.hasTag(WishlistTag.saving)}>
                                        <Icon name={ state.context.favs.has(item.partId) ? 'star' : 'star-outline' }/>
                                    </Button>
                                </Right>
                            </ListItem>
                        )}/>
                :
            state.hasTag(WishlistTag.loading)
                ? <Loading />
                :
            state.hasTag(WishlistTag.error)
                ? <Error onRetry={() => send({ type: 'RETRY' })} />
                : null
        }</Container>
}
