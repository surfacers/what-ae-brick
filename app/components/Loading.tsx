import { Spinner, View } from 'native-base';
import * as React from 'react';
import { Animated, StyleSheet } from 'react-native';
import LoadingSvg from './loading.svg'
import Svg, {G,Path, Polygon} from 'react-native-svg';
import { Text } from "react-native";

let AnimatePath = Animated.createAnimatedComponent(Path);
// TODO: primary color on Spinner
export const Loading = () => {
    const offset = React.useRef(new Animated.Value(1000)).current; // Initial value for opacity: 0

    React.useEffect(() => {
    Animated.loop(
        Animated.sequence([
        Animated.timing(offset, {
            toValue: 320,
            duration: 200,
            // easing: 50,
            useNativeDriver: true,
        }),
        Animated.timing(offset, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
        }),
        ])
    ).start();
    }, [offset]);
    console.log(offset)
    return <View style={ styles.container }>
        {/* <Spinner color="blue" style={styles.container} /> */}
        {/* <LoadingSvg style={styles.container} width="100"></LoadingSvg> */}
        <Animated.View>
            <View>
            <Text>{offset.}</Text>
        <Svg style={styles.container}
                        height="144.216"
                         width="195.667"
                    >
                        <G fill="none">
                            <Polygon
                                points="100.333,28.248 72.333,28.248 72.333,6.646 35.994,6.646 35.994,28.248 5.884,28.248 5.884,137.57 
                                189.783,137.57 189.783,28.248 159.671,28.248 
                                159.671,6.646 123.333,6.646 123.333,28.248"
                                stroke="#ffffff"
                                strokeWidth="4"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeDasharray="1000"
                                strokeDashoffset={offset}
                               />
                           </G>
                      </Svg></View>
                      </Animated.View>
    </View>
};
{/* <svg viewBox="0 0 195.667 144.216">
  <polygon  stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" stroke-miterlimit="10" 
  points=" " class="path"/>
</svg> */}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor:'white',
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