import React, { useRef } from "react";
import { createMachine } from "xstate";
import { createModel } from "xstate/lib/model";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Camera } from "expo-camera";
import CameraMask from "react-native-barcode-mask";
import { useMachine } from "@xstate/react";

type ScanMachineContext = {
  uris: string[];
};

const scanModel = createModel(
  {
    uris: [] as string[],
  },
  {
    events: {
      SHUTTER_PRESSED: () => ({}),
      SHUTTER_RELEASED: () => ({}),
      SHUTTER_CANCELED: () => ({}),
    },
  }
);

const scanMachine = createMachine<typeof scanModel>(
  {
    initial: "idle",
    context: scanModel.initialContext,
    states: {
      idle: {
        on: {
          SHUTTER_PRESSED: "pressingShutter",
        },
      },
      pressingShutter: {
        tags: "pressing",
        on: {
          SHUTTER_RELEASED: "idle",
        },
        after: {
          MULTIPLE_PICTURES_DELAY: { actions: "takePicture" },
        },
      },
    },
  },
  {
    actions: {
      test: () => {},
    },
    services: {},
    delays: {
      MULTIPLE_PICTURES_DELAY: 500,
    },
  }
);

export function ScanBrick() {
  const cameraRef = useRef<Camera>(null);
  const [state, send] = useMachine(scanMachine);

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <CameraMask
          height={200}
          width={200}
          lineAnimationDuration={1000}
          edgeBorderWidth={3}
          outerMaskOpacity={0.7}
          // onLayoutMeasured={(value) => console.log({layout: value})}
        ></CameraMask>
        <Text style={styles.text}>{state.tags}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => send("SHUTTER_PRESSED")}
            onPressOut={() => send("SHUTTER_RELEASED")}
            onPress={() => cameraRef.current?.pausePreview()}
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
    fontSize: 10,
    color: "white",
  },
  shutterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
});
