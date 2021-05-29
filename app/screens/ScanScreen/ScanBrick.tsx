import React, { useEffect, useRef } from "react";
import { assign, createMachine } from "xstate";
import { createModel } from "xstate/lib/model";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Button,
  Image,
  Animated,
} from "react-native";
import { Camera } from "expo-camera";
import CameraMask from "react-native-barcode-mask";
import { useMachine } from "@xstate/react";
import { raise } from "xstate/lib/actions";
import MaskSvg from "./mask.svg";

const scanModel = createModel(
  {
    uris: [] as string[],
  },
  {
    events: {
      SHUTTER_PRESSED: () => ({}),
      SHUTTER_RELEASED: () => ({}),
      SHUTTER_CANCELED: () => ({}),
      TAKE_PICTURE: () => ({}),
      RESTART: () => ({}),
    },
  }
);

const scanMachine = createMachine<typeof scanModel>(
  {
    id: "scan",
    initial: "idle",
    context: scanModel.initialContext,
    states: {
      idle: {
        entry: [assign(() => scanModel.initialContext)],
        on: {
          SHUTTER_PRESSED: "scanning",
        },
      },
      scanning: {
        on: {
          SHUTTER_CANCELED: "idle",
        },
        initial: "first",
        type: "parallel",
        states: {
          shutter: {
            initial: "pressed",
            states: {
              pressed: {
                on: {
                  SHUTTER_RELEASED: {
                    target: "released",
                    actions: [raise("TAKE_PICTURE")],
                  },
                },
                after: {
                  SHUTTER_HOLDING: {
                    target: "holding",
                    actions: [raise("TAKE_PICTURE")],
                  },
                },
              },
              holding: {
                on: {
                  SHUTTER_RELEASED: {
                    target: "released",
                    actions: [raise("TAKE_PICTURE")],
                  },
                },
                after: {
                  MULTIPLE_PICTURES_DELAY: {
                    target: "holding",
                    actions: [raise("TAKE_PICTURE")],
                  },
                },
              },
              released: {
                type: "final",
              },
            },
          },
          picture: {
            initial: "initial",
            states: {
              initial: {
                on: {
                  TAKE_PICTURE: "taking",
                },
              },
              taking: {
                invoke: {
                  id: "takePicture",
                  src: "takePicture",
                  onDone: {
                    target: "idle",
                    actions: [
                      assign({
                        uris: (context, event) => [...context.uris, event.data],
                      }),
                    ],
                  },
                  onError: "idle",
                },
              },
              idle: {
                type: "final",
                on: {
                  TAKE_PICTURE: "taking",
                },
              },
            },
          },
        },
        onDone: "preprocessing",
      },
      preprocessing: {
        // invoke: {
        //   src: "preprocessImages",
        //   onDone: "detecting",
        // },
        /* --- remove this if service works --- */
        on: {
          SHUTTER_PRESSED: {
            target: "scanning",
            actions: [assign(() => scanModel.initialContext)],
          },
        },
      },
      detecting: {
        invoke: {
          src: "detectBrick",
          onDone: "brick_detected",
          onError: "brick_not_detected",
        },
      },
      brick_detected: {
        type: "final",
        on: {
          RESTART: "idle",
        },
      },
      brick_not_detected: {
        type: "final",
        on: {
          RESTART: "idle",
        },
      },
    },
  },
  {
    delays: {
      SHUTTER_HOLDING: 2000,
      MULTIPLE_PICTURES_DELAY: 1500,
    },
  }
);

function Mask() {
  const pulse = useRef(new Animated.Value(1)).current; // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <MaskSvg width={200} height={200} />
    </Animated.View>
  );
}

export function ScanBrick() {
  const cameraRef = useRef<Camera>(null);
  const [state, send] = useMachine(scanMachine, {
    services: {
      takePicture: () =>
        cameraRef.current!.takePictureAsync().then((result) => result.uri),
    },
  });

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.maskWrapper}>

        <Mask />
        </View>
        {/* <CameraMask
          height={200}
          width={200}
          lineAnimationDuration={1000}
          edgeBorderWidth={3}
          outerMaskOpacity={0.7}
          showAnimatedLine={false}
          // onLayoutMeasured={(value) => console.log({layout: value})}
        ></CameraMask> */}
        <View style={styles.debugContainer}>
          <Text style={styles.text}>
            State: {JSON.stringify(state.value, null, 2)}
          </Text>
          {/* <Text style={styles.text}>
            Picture Uris:{" "}
            {JSON.stringify(
              state.context.uris.map((uri) => uri.split("/").pop()),
              null,
              2
            )}
          </Text> */}
          <View style={{ flex: 1, flexDirection: "row" }}>
            {state.context.uris.map((uri) => (
              <Image
                key={uri.split("/").pop()}
                style={{ width: 50, height: 50 }}
                source={{ uri }}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => send("SHUTTER_PRESSED")}
            onPressOut={() => send("SHUTTER_RELEASED")}
            // onPress={() => cameraRef.current?.pausePreview()}
          >
            <View style={styles.shutterButton}></View>
          </TouchableOpacity>
          {/* <Button title="Reset" onPress={() => send("RESTART")}></Button> */}
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
  maskWrapper: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  debugContainer: {
    position: "absolute",
    flex: 1,
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
