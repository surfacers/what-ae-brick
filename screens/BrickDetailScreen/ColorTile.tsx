import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { PartColorData } from '../../types';
import { Text } from '../../components/Themed';
import { isColorDark } from './ColorUtils';

export default function ColorTile(props: { partColorData: PartColorData }) {
    return <View style={
        {
            ...styles.tile,
            backgroundColor: "#" + props.partColorData.rgb
        }}>
        <View style={props.partColorData.is_trans ? styles.transparancyIndicator : {}}></View>
        <Text style={{
            ...styles.text,
            color: isColorDark(props.partColorData.rgb ?? "ffffff") ? 'white' : 'black'
        }}>{props.partColorData.color_name}</Text></View>
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    tile: {
        width: '100%',
        aspectRatio: 1,
        margin: '0%',
        borderRadius: 10,
        backgroundColor: "#ffffff",
        padding: 5,
        justifyContent: 'flex-end',
        overflow: 'hidden'
    },
    transparancyIndicator: {
        position: 'absolute',
        top: '-20%',
        left: '10%',
        opacity: 0.4,
        transform: [{ rotate: '40deg' }],
        width: '20%',
        height: '150%',
        backgroundColor: '#bbb'
    },
    text: {
        textTransform: 'uppercase'
    }
});
