import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/Themed';
import { PartColorDto } from '../../data';
import { isColorDark } from './ColorUtils';

export default function ColorTile(props: {
    partColor: PartColorDto
}) {
    return <View style={{...styles.tile, backgroundColor: "#" + props.partColor.hex }}>
        <View style={props.partColor.isTransparent ? styles.transparancyIndicator : {}}></View>
        <Text style={{
            ...styles.text,
            color: isColorDark(props.partColor.hex ?? "ffffff") ? 'white' : 'black'
        }}>{props.partColor.colorName}</Text>
    </View>
}


const styles = StyleSheet.create({
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
