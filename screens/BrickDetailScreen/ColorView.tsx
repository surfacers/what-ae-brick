import * as React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { fetchingMachine } from '../../machines/fetching.machine';
import { PartColorData } from '../../types';
import ColorTile from './ColorTile';
import { FlatGrid } from 'react-native-super-grid';
import { View } from '../../components/Themed';
import { updateRGBData } from '../../model/database';
import { sortByColor } from './ColorUtils';
import { useMachine } from '@xstate/react';


export default function ColorView(props: {
  colorData: PartColorData[],
}) {
  var [state, _] = useMachine(fetchingMachine, {
    services: {
      fetchOffline: () => updateRGBData(props.colorData),
      fetchOnline: () => updateRGBData(props.colorData),
      postProcessing: () => new Promise((resolve, _) => {
        var res = sortByColor<PartColorData>(props.colorData, (element: PartColorData) => element.rgb ?? null)
        resolve(res);
      })
    },
  });

  if (state.hasTag("finished")) {
    console.log("finished");
    return <View style={styles.container}>
      <FlatGrid
        data={props.colorData}
        itemDimension={70}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              margin: 1
            }}>
            <ColorTile partColorData={item} />
          </View>
        )}
      /></View>
  }
  return <ActivityIndicator />
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
