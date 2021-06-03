import { Icon } from 'native-base';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../components/Themed';
import { PartColorDto } from '../../../data';
import { isColorDark } from './ColorUtils';

export default function ColorTile(props: {
    partColor: PartColorDto
}) {
    const color = isColorDark(props.partColor.hex ?? "ffffff") ? 'white' : 'black';
    return <View style={{ ...styles.tile, backgroundColor: "#" + props.partColor.hex }}>
        <View style={props.partColor.isTransparent ? styles.transparancyIndicator : {}}></View>
        <View style={styles.sets}>
            <Icon name='box' type='Feather' style={{color: color, ...styles.setIcon}} />
            <Text style={{color: color}}>{props.partColor.sets}</Text>
        </View>
        <Text style={{...styles.text, color: color}}>{props.partColor.colorName}</Text>

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
    sets: {
        position: 'absolute',
        right: 5,
        top: 5,
        textAlign: 'right',
        opacity: 0.5,
        flexDirection: 'row',
    },
    setIcon:{
        fontSize: 14,
        marginRight: 2
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
