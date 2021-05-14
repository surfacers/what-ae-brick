import { Spinner, View } from 'native-base';
import * as React from 'react';
import { StyleSheet } from 'react-native';


// TODO: primary color on Spinner
export const Loading = () => (
    <View style={ styles.container }>
        <Spinner color="blue" style={styles.container} />
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