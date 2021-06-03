import { Button, H1, Text, View } from 'native-base';
import * as React from 'react';
import { Image, Linking, StyleSheet } from 'react-native';
import { PartColorDto, PartDto } from '../../data';
import { partImageUrl } from '../../data/parts.service';
import ColorView from './ColorView';
import { sortByColor } from './ColorView/ColorUtils';

const openBrickLink = (partId: string) =>
    Linking.openURL(`https://www.bricklink.com/v2/catalog/catalogitem.page?P=${partId}`)

const openRebrickable = (partId: string) =>
    Linking.openURL(`https://rebrickable.com/parts/${partId}`)


export default function BrickDetailView(props: {
    part: PartDto,
    partColors: PartColorDto[]
}) {
    const sortedColors = sortByColor(props.partColors, p => p.hex)

    return <View>
        <H1 style={styles.h1}>{props.part.name} ({props.part.id})</H1>
        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: partImageUrl(props.part.id) }} />
            </View>
        </View>
        <View style={styles.infoContainer}>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'Production'}</Text>
                <Text style={styles.infoSubTitle}>
                    {props.part.productionFrom}-{props.part.productionTo}
                </Text>
            </View>
            {props.part.prints > 0 &&
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'# Prints'}</Text>
                <Text style={styles.infoSubTitle}>{props.part.prints}</Text>
            </View>
            }
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'# Sets'}</Text>
                <Text style={styles.infoSubTitle}>{props.part.sets}</Text>
            </View>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'# Set parts'}</Text>
                <Text style={styles.infoSubTitle}>{props.part.setParts}</Text>
            </View>
        </View>
        <View style={styles.buttonContainer}>
            <Button style={styles.buttonElement} onPress={() => openBrickLink(props.part.id)}>
                <Text>Go to BrickLink</Text>
            </Button>
            <Button style={styles.buttonElement} onPress={() => openRebrickable(props.part.id)}>
                <Text>Go to Rebrickable</Text>
            </Button>
        </View>
        <ColorView partColors={props.partColors} />
    </View>
}

const styles = StyleSheet.create({
    h1: {
        textAlign: 'center',
        paddingVertical: 20
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
    },
    image: {
        width: 230,
        height: 230,
        marginVertical: 10,
        marginHorizontal: 'auto',
        alignSelf: 'center'
    },
    infoContainer: {
        flexDirection: 'row',
        width: '85%',
        alignSelf: 'center',
        paddingVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '80%',
        alignSelf: 'center',
        justifyContent: 'center'
    },
    buttonElement: {
        margin: 10
    },
    infoTitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    infoSubTitle: {
        fontSize: 18,
        textAlign: 'center',
    },
    infoElement: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10
    }
});
