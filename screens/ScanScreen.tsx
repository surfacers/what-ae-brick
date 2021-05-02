import { Camera } from "expo-camera";
import * as React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import BarcodeMask from "react-native-barcode-mask";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";

const machine = createMachine({
  initial: "idle",
  states: {
    idle: {
      tags: "idle",
      on: {
        DOWN: "holding",
      },
    },
    holding: {
      tags: "pressing",
      on: {
        UP: "idle",
      },
    },
  },
});

export default function HistoryScreen() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [state, send] = useMachine(machine);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera}>
        <BarcodeMask
          height={200}
          width={200}
          lineAnimationDuration={1000}
        ></BarcodeMask>
          <Text style={styles.text}>{state.tags}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => send("DOWN")}
            onPressOut={() => send("UP")}
            >
            <View style={styles.shutterButton}></View>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  shutterButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "white",
  },
});
