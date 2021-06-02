import { Container, Spinner, View } from 'native-base';
import * as React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { AnimatedSVGPath } from 'react-native-svg-animations';
import { Easing } from 'react-native';

export const Loading = (props:{color?:string, scale?:number|undefined, text?:string|undefined}) => <View style={styles.container}>
<AnimatedSVGPath
  strokeColor={props.color ?? "black"} // TODO: change to primary color
  duration={1500}
  strokeWidth={6}
  height={144.216}
  width={195.667}
  scale={props.scale ?? 0.3}
  delay={100}
  easing={Easing.inOut(Easing.ease)}
  d="M100.333,28.248L72.333 28.248 72.333 6.646 35.994 6.646 35.994 28.248 5.884 28.248 5.884 137.57 189.783 137.57 189.783 28.248 159.671 28.248 159.671 6.646 123.333 6.646 123.333 28.248z"
  loop={true}
  rewind={true}
/>
<Text style={{color:props.color ?? "black"}}>{props.text}</Text>
</View>


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