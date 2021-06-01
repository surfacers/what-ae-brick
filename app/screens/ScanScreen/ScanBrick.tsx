import React, { useEffect, useRef, useState } from "react";
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
import WebView from "react-native-webview";
import MaskSvg from "./mask.svg";
import opencv from '../../assets/webviews/opencv.html';
import { predict } from "../../classification";

const scanModel = createModel(
  {
    images: [] as string[],
    processedImages: [] as string[],
    detectedBrickId: "",
  },
  {
    events: {
      OPENCV_RUNTIME_INITIALIZED: () => ({}),
      SHUTTER_PRESSED: () => ({}),
      SHUTTER_RELEASED: () => ({}),
      SHUTTER_CANCELED: () => ({}),
      TAKE_PICTURE: () => ({}),
      IMAGE_PREPROCESSED: (data: string) => ({ data }),
      RESTART: () => ({}),
    },
  }
);

const scanMachine = createMachine<typeof scanModel>(
  {
    id: "scan",
    type: "parallel",
    context: scanModel.initialContext,
    states: {
      opencv: {
        initial: "loading",
        states: {
          loading: {
            on: {
              OPENCV_RUNTIME_INITIALIZED: "ready"
            }
          },
          ready: {
            type: "final"
          }
        }
      },
      detection: {
        initial: "idle",
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
                            images: (context, event) => [...context.images, event.data],
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
            initial: "waitingForOpenCV",
            states: {
              waitingForOpenCV: {
                always: {
                  target: "processImage",
                  in: "#scan.opencv.ready"
                }
              },
              processImage: {
                entry: ["preprocessImage"],
                on: {
                  IMAGE_PREPROCESSED: {
                    target: "imageProcessed",
                    actions: [
                      assign({
                        processedImages: ({ processedImages }, { data: image }) => [...processedImages, image],
                      })
                    ]
                  }
                }
              },
              imageProcessed: {
                always: [{
                  target: "completed",
                  cond: ({ images, processedImages }) => images.length === processedImages.length
                },
                {
                  target: "processImage"
                }],
              },
              completed: {
                type: "final"
              }
            },
            onDone: {
              target: "detecting"
            },
          },
          detecting: {
            invoke: {
              src: "detectBrick",
              onDone: {
                target: "brick_detected",
                actions: [
                  assign({
                    detectedBrickId: (_, event) => event.data,
                  }),
                ]
              },
              onError: "brick_not_detected",
            },
          },
          brick_detected: {
            // type: "final",
            entry: [
              "showDetailScreen"
            ],
            on: {
              SHUTTER_PRESSED: "idle",
            },
          },
          brick_not_detected: {
            // type: "final",
            on: {
              SHUTTER_PRESSED: "idle",
            },
          },
        },
      }
    }
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
  const webviewRef = useRef<WebView>(null);
  const [state, send] = useMachine(scanMachine, {
    actions: {
      preprocessImage: ({ images, processedImages }) => {
        const image = images[processedImages.length]
        webviewRef.current!.injectJavaScript(`preprocess("${image}")`)
      },
      showDetailScreen: ({ detectedBrickId }) => {
        console.log(`TODO: navigate to ${detectedBrickId}`)
      }
    },
    services: {
      takePicture: () =>
        cameraRef.current!.takePictureAsync({ base64: true, quality: 0 }).then(
          (result) => "data:image/jpg;base64," + result.base64),
      detectBrick: ({processedImages}) => predict(processedImages[0])
    },
  });

  return (
    <View style={styles.container}>
      <WebView
        // injectedJavaScriptBeforeContentLoaded={`
        //       window.onerror = function(message, sourcefile, lineno, colno, error) {
        //         alert("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
        //         return true;
        //       };
        //       true;
        //     `}
        ref={webviewRef}
        source={opencv}
        onMessage={(e) => send(JSON.parse(e.nativeEvent.data))}
        containerStyle={{ position: "absolute", width: 300, height: 300 }}
      />
      <Camera style={styles.camera} ref={cameraRef} pictureSize="Medium">
        <View style={styles.maskWrapper}>

          <Mask />
        </View>
        <View style={styles.debugContainer}>
          <Text style={styles.text}>
            State: {JSON.stringify(state.value, null, 2)}
          </Text>
          <Text>Detected: {state.context.detectedBrickId}</Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            {state.context.images.map((base64, index) => (
              <Image
                key={index}
                style={{ width: 50, height: 50 }}
                source={{ uri: base64 }}
              />
            ))}
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            {state.context.processedImages.map((base64, index) => (
              <Image
                key={index}
                style={{ width: 50, height: 50 }}
                source={{ uri: base64 }}
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
