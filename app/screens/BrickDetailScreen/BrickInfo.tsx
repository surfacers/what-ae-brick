import * as React from 'react';
import { StyleSheet, Image, Linking } from 'react-native';
import ColorView from './ColorView';
import { PartColorData } from '../../types';
import { Button, Text, H1, View } from 'native-base';


export default function BrickDetailView(props: { partData: any, colorData: { results: PartColorData[] } }) {
    // const colorScheme = useColorScheme();
    return <View>
        <H1 style={styles.h1}>{props.partData.name} ({props.partData.part_num})</H1>
        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{
                    uri: props.partData.part_img_url,
                }} />
            </View>
        </View>
        <View style={styles.infoContainer}>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'Production'}</Text>
                <Text style={styles.infoSubTitle}>{`${props.partData.year_from}-${props.partData.year_to}`}</Text>
            </View>
            <View style={styles.infoElement}>
                <Text style={styles.infoTitle}>{'# Prints'}</Text>
                <Text style={styles.infoSubTitle}>{props.partData.prints.length}</Text>
            </View>
        </View>
        <View style={styles.buttonContainer}>
            <View style={styles.buttonElement} >
                <Button onPress={
                    () => Linking.openURL('https://www.bricklink.com/v2/catalog/catalogitem.page?P=' + props.partData.part_num)
                }><Text>Go to BrickLink</Text></Button>
            </View>
            <View style={styles.buttonElement}>
                <Button onPress={
                    () => Linking.openURL(props.partData.part_url)
                }><Text>Go to Rebrickable</Text></Button>
            </View>
        </View>
        <ColorView colorData={props.colorData.results} />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    h1: {
        flex: 1,
        flexDirection: 'row',
        textAlign: 'center',
        // justifyContent:'center'
        paddingVertical: 20
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
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
        paddingHorizontal: 10
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
