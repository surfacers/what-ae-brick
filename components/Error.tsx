import { Button, Content, Text } from 'native-base';
import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

export const Error = ({ onRetry }: { onRetry: () => void }) => (
    <Content contentContainerStyle={styles.container}>
        <Image style={ styles.image } source={require('../assets/images/error.png')}></Image>
        <Text style={styles.errorText}>Error while loading</Text>
        <Button style={{ alignSelf: 'center' }} light onPress={onRetry}>
            <Text>Retry</Text>
        </Button>
    </Content>
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
