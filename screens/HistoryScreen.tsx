import * as React from 'react';
import { Image, FlatList, SafeAreaView, StatusBar, StyleSheet, ActivityIndicator, TouchableHighlight, Button } from 'react-native';

import simpleDataFetchMachine, { DataFetchTag } from '../machines/data-fetch.machine';

import { Text, View } from '../components/Themed';
import { useMachine } from '@xstate/react';
import { Ionicons } from '@expo/vector-icons';

interface HistoryItem {
    id: string,
    brickId: string,
    brickName: string,
    uri: string,
    timeStamp: Date
}

type ListItemParams = {
    item: HistoryItem,
    separators: any
}
const ListItem = ({ item, separators }: ListItemParams) => (
    <TouchableHighlight
        key={item.id}
        onPress={() => { console.log('pres') }}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}>
        <View style={styles.item}>
            <Image style={styles.itemImage} source={{ uri: item.uri }} />
            <Text style={styles.title}>{item.brickName}</Text>
            <Ionicons size={30} name="md-chevron-forward" style={{ flex: 1, textAlign: 'right', color: 'grey', fontSize: 20 }} />
        </View>
    </TouchableHighlight>
);
const EmptyList = () => (
    <View style={styles.container}>
        <Image style={styles.image} source={require('../assets/images/empty-history.png')} />
        <Text style={styles.help}>No scanned bricks</Text>
    </View>
);
const ItemDivider = () => (<View style={styles.divider}></View>);

const dataFetchMachine = simpleDataFetchMachine<HistoryItem>();
// TODO: Load from SQLLite Database
const loadData = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        const data: HistoryItem[] = [...new Array(30)].map((_, i) => ({
            id: `${i}`,
            brickId: '3001',
            brickName: `item ${i + 1}`,
            uri: 'https://cdn.rebrickable.com/media/thumbs/parts/ldraw/13/3001.png/85x85p.png',
            timeStamp: new Date()
        }))

        // resolve(data)
        // resolve([])
        reject('No internet connection')
    }, 1000)
});

export default function HistoryScreen() {
    const [state, send, _] = useMachine(dataFetchMachine, {
        services: {
            fetchData: loadData
        }
    });

    if (state.hasTag(DataFetchTag.idle)) {
        send({ type: 'FETCH' })
    }

    return <View style={styles.container}>{
        state.hasTag(DataFetchTag.loading) && state.context.data == null
            ? <ActivityIndicator size="large" color="#0000ff" />
            :
        state.hasTag(DataFetchTag.success) && (state.context.data?.length ?? 0) > 0
            ? <FlatList
                style={styles.list}
                data={state.context.data ?? []}
                renderItem={({ item, separators }) => ListItem({ item, separators })}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={ItemDivider}
                onRefresh={() => send({ type: 'RETRY' })}
                refreshing={state.hasTag(DataFetchTag.loading)} />
            :
        state.hasTag(DataFetchTag.success)
            ? EmptyList()
            : <View>
                <Text style={{ marginBottom: 8, color: 'red' }}>
                    Error while loading
                </Text>
                <Button
                    onPress={() => send({ type: 'RETRY' })}
                    title="Retry" />
            </View>
        }
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        width: '100%',
        padding: 10,
        marginVertical: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
    divider: {
        backgroundColor: '#C5C5C7',
        height: 1,
        marginLeft: 20
    },
    title: {
        fontSize: 20,
    },
    image: {
        width: 250,
        height: 250
    },
    help: {
        fontSize: 18,
        color: 'grey'
    },
    list: {
        width: '100%'
    },
    itemImage: {
        width: 40,
        height: 40,
        marginRight: 10
    }
});
