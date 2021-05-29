import { Button, H1, Text, View } from 'native-base';
import * as React from 'react';
import { Image, Linking, StyleSheet } from 'react-native';
import { PartColorDto, PartDto } from '../../data';
import { isColorDark, sortByColor } from './ColorUtils';
import ColorView from './ColorView';

// TODO: put somewhere else
const partImageUri = (partId: string, colorId: string) =>
    `https://cdn.rebrickable.com/media/thumbs/parts/ldraw/${colorId}/${partId}.png/230x230.png`

const openBrickLink = (partId: string) =>
    Linking.openURL(`https://www.bricklink.com/v2/catalog/catalogitem.page?P=${partId}`)

export default function BrickDetailView(props: {
    part: PartDto,
    partColors: PartColorDto[]
}) {
    // const colorScheme = useColorScheme();

    const sortedColors = sortByColor(props.partColors, p => p.hex)
    const defaultColor = sortedColors.find(s => isColorDark(s.hex) && !s.isTransparent) || sortedColors[0]

    return <View>
        <H1 style={styles.h1}>{props.part.name} ({props.part.id})</H1>
        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: partImageUri(defaultColor.partId, defaultColor.colorId)}} />
            </View>
        </View>
        <View style={styles.infoContainer}>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'Production'}</Text>
                <Text style={styles.infoSubTitle}>
                    {props.part.productionFrom}-{props.part.productionTo}
                </Text>
            </View>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'# Prints'}</Text>
                <Text style={styles.infoSubTitle}>{props.part.prints}</Text>
            </View>
        </View>
        <View style={styles.buttonContainer}>
            <Button style={styles.buttonElement} onPress={() => openBrickLink(props.part.id)}>
                <Text>Go to BrickLink</Text>
            </Button>
            {/* TODO: Adjust URL */}
            <Button style={styles.buttonElement} onPress={() => Linking.openURL(props.part.part_url)}>
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
        width: '80%',
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
        width: '50%',
        justifyContent: 'center',
        paddingHorizontal: 10
    }
});