import * as React from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { PartColorDto } from '../../../data';
import ColorTile from './ColorTile';

export default function ColorView(props: {
    partColors: PartColorDto[],
}) {
    return <FlatGrid
        data={props.partColors}
        itemDimension={70}
        renderItem={({ item }) =>
            <ColorTile partColor={item} />
        } />
}
