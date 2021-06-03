import { Text, View } from 'native-base';
import * as React from 'react';
import { FlatList, Image, ListRenderItem, RefreshControl, StyleSheet } from 'react-native';

interface EmptyListParams {
    emptyText: string
}
const EmptyList = ({ emptyText }: EmptyListParams) => (
    <View style={styles.container}>
        <Image style={ styles.image } source={require('../assets/images/empty.png')}></Image>
        <Text style={styles.helpText}>{emptyText}</Text>
    </View>
);

interface ListParams<Item> {
    data: Item[],
    keyExtractor: (item: Item) => string,
    renderItem: ListRenderItem<Item> | null | undefined,
    loading: boolean,
    reload: () => void
    emptyText: string
}
export const List = <Item extends unknown>
    ({ data, keyExtractor, renderItem, loading, reload, emptyText }: ListParams<Item>) => (
    <View  style={{flex: 1}}>
        <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={reload} />}
            ListEmptyComponent={() => EmptyList({ emptyText })}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}>
        </FlatList>
    </View>
);

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
    image: {
        resizeMode: 'contain',
        width: 300,
        height: 300
    }
});
