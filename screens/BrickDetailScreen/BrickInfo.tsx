import * as React from 'react';
import { StyleSheet, Image, SectionList, Linking, Button} from 'react-native';
import { Text, View } from '../../components/Themed';



export default function BrickDetailScreen(props: { partData: any }) {
    return <View style={styles.container}>
        <Text style={styles.title}>{props.partData.name} ({props.partData.part_num})</Text>
        <Image style={styles.image} source={{
            uri: props.partData.part_img_url,
        }} />
        <SectionList
            style={styles.section}
            sections={[
                {
                    title: 'Additional Info', data: [
                        { title: 'Prints', subtitle: props.partData.prints.length },
                        { title: 'Years', subtitle: `${props.partData.year_from}-${props.partData.year_to}` }]
                },
            ]}
            renderItem={({ item }) => <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionSubTitle}>{item.subtitle}</Text>

            </View>}
            renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            keyExtractor={(item) => item.title}
            
        />
        <Button title='Go to Rebrickable' onPress={
            () => Linking.openURL(props.partData.part_url)
        }></Button>
        
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    image: {
        width: 250,
        height: 250,
        marginVertical: 20
    },
    section: {
        width: '100%'
    },
    sectionHeader: {
        paddingTop: 2,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 2,
        fontSize: 14,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
    },
    sectionSubTitle: {
        fontSize: 18,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        padding: 10,
        height: 44,
        borderBottomColor: 'rgba(255,255,255,0.1)'//{
        //     light:'#eee',
        //     dark: 'rgba(255,255,255,0.1)'
        // }
    }
});
