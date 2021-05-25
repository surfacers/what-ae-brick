import * as React from 'react';
import { StyleSheet, Image, Linking, Button } from 'react-native';
import useColorScheme from '../../hooks/useColorScheme';
import ColorView from './ColorView';
import { Text, View } from '../../components/Themed';
import { PartColorData } from '../../types';
import Colors from '../../constants/Colors';


export default function BrickDetailScreen(props: { partData: any, colorData: { results: PartColorData[] } }) {
    const colorScheme = useColorScheme();
    return <View style={styles.container} >
        <Text style={styles.title}>{props.partData.name} ({props.partData.part_num})</Text>
        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{
                    uri: props.partData.part_img_url,
                }} />
            </View>
        </View>
        <View>
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
        </View>
        <View>
            <View style={styles.buttonContainer}>
                <View style={styles.infoElement}>
                    <Button title='Go to BrickLink' color={Colors[colorScheme].buttonColor} onPress={
                        () => Linking.openURL('https://www.bricklink.com/v2/catalog/catalogitem.page?P=' + props.partData.part_num)
                    }></Button>
                </View>
                <View style={styles.infoElement}>
                    <Button title='Go to Rebrickable' color={Colors[colorScheme].buttonColor} onPress={
                        () => Linking.openURL(props.partData.part_url)
                    }></Button>
                </View>
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
    imageContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginVertical: 10,
        alignSelf: 'center',
        textAlign: 'center'
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
        borderBottomColor: 'rgba(255,255,255,0.2)',
        borderBottomWidth: 2
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '80%',
        alignSelf: 'center',
        paddingVertical: 10,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        borderBottomWidth: 2
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
