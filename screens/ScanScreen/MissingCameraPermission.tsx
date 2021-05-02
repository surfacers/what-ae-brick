import React from "react";
import { Button, View, Text } from "react-native";

export function MissingCameraPermission(props: { requestPermission: () => void }) {
  return (
    <View>
      <Text>No access to camera</Text>
      <Button
        title="Request"
        onPress={props.requestPermission}
      ></Button>
    </View>
  );
}
