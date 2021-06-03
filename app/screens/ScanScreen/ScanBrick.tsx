import React, { useCallback, useRef, useState } from "react";
import { assign, createMachine } from "xstate";
import { createModel } from "xstate/lib/model";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Image
} from "react-native";
import { Camera } from "expo-camera";
import { useMachine } from "@xstate/react";
import { raise } from "xstate/lib/actions";
import WebView from "react-native-webview";
import MaskSvg from "./mask.svg";
import { predict, initModel } from "../../classification";
import { opencv } from './opencvweb';
import { allParts, PartDto } from '../../data';
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from '@react-navigation/native'
import { Loading } from "../../components";
import { Popover } from "react-native-popable"
import { saveToHistory } from "../../data/history.service";

const scanModel = createModel(
  {
    images: [] as string[],
    processedImages: [] as string[],
    detectedBrick: undefined as (PartDto | undefined)
  },
  {
    events: {
      OPENCV_RUNTIME_INITIALIZED: () => ({}),
      SHUTTER_PRESSED: () => ({}),
      SHUTTER_RELEASED: () => ({}),
      SHUTTER_CANCELED: () => ({}),
      TAKE_PICTURE: () => ({}),
      IMAGE_PREPROCESSED: (data: string) => ({ data }),
      SHOW_DETAIL: () => ({}),
      SHOW_CAMERA: () => ({})
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
      tensorflow: {
        initial: "loading",
        states: {
          loading: {
            invoke: {
              id: "initializeTensorflow",
              src: initModel,
              onDone: "ready"
            },
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
            tags: ["shutterEnabled", "scanning", "idle"],
            entry: [assign(() => scanModel.initialContext)],
            on: {
              SHUTTER_PRESSED: "scanning",
            },
          },
          scanning: {
            tags: ["shutterEnabled", "scanning"],
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
            tags: ["processing", "preprocessing"],
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
            tags: ["processing", "detecting"],
            initial: "waitingForTensorflow",
            states: {
              waitingForTensorflow: {
                always: {
                  target: "detectBrick",
                  in: "#scan.tensorflow.ready"
                }
              },
              detectBrick: {
                invoke: {
                  id: "detectBrick",
                  src: "detectBrick",
                  onDone: {
                    target: "completed",
                    actions: [
                      assign({
                        detectedBrick: (_, event) => allParts.find(p => p.id == event.data)
                      }),
                    ]
                  },
                }
              },
              completed: {
                type: "final"
              }
            },
            onDone: {
              target: "brick_detected"
            },
          },
          brick_detected: {
            tags: ["shutterEnabled", "detected"],
            entry: ["saveBrickToHistory"],
            on: {
              SHOW_DETAIL: { actions: "showDetailScreen" },
              SHUTTER_PRESSED: "idle",
              SHOW_CAMERA: "idle",
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
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false)



  const [state, send] = useMachine(scanMachine, {
    actions: {
      preprocessImage: ({ images, processedImages }) => {
        const image = images[processedImages.length]
        webviewRef.current!.injectJavaScript(`preprocess("${image}")`)
      },
      saveBrickToHistory: ({ detectedBrick }) => {
        saveToHistory(detectedBrick?.id);
        console.log(`saved ${detectedBrick?.id}`)
      },
      showDetailScreen: ({ detectedBrick }) => {
        cameraRef.current?.pausePreview();
        navigation.navigate("BrickDetailScreen", { partId: detectedBrick?.id });
      }
    },
    services: {
      takePicture: () =>
        cameraRef.current!.takePictureAsync({ base64: true, quality: 0 })
            .then((result) => "data:image/jpg;base64," + result.base64),
      detectBrick: ({ processedImages }) => predict(processedImages[0])
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log("camera visible");
      setTimeout(() => {
        setIsVisible(true);
        send('SHOW_CAMERA');
      }, 300);

      return () => {
        setIsVisible(false);
        console.log("camera invisible");
      }
    }, [])
  )

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
        originWhitelist={['*']}
        source={{ html: opencv }}
        onMessage={(e) => send(JSON.parse(e.nativeEvent.data))}
        containerStyle={{ position: "absolute", width: 1, height: 1 }}
      />
      <View style={styles.cameraContainer}>
        {isVisible &&
          <Camera style={styles.camera} ref={cameraRef} pictureSize="Medium" ratio="16:9" >
            {/* <View style={styles.debugContainer}>
            <Text style={styles.text}>
              State: {JSON.stringify(state.value, null, 2)}
            </Text>
            <Text style={styles.text}>Detected: {state.context.detectedBrick?.id} {state.context.detectedBrick?.name}</Text>
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
          </View> */}
          </Camera>
        }

      </View>
      <View style={styles.overlayContainer}>
        <View style={{ width: 224, height: 224 }}>
          <View style={styles.detectedContainer}>
            <TouchableOpacity onPress={() => send("SHOW_DETAIL")}>
              <Popover
                backgroundColor="white"
                position="top"
                visible={state.hasTag("detected")}
                style={{ alignItems: "center", justifyContent: "space-between", height: 35 }}>
                <Text style={{ color: "black", margin: 5 }}>{state.context.detectedBrick?.name}</Text>
              </Popover>
            </TouchableOpacity>
          </View>
          <View style={styles.maskContainer}>
            {
              state.hasTag("processing") &&
              <View>
                <Loading text={state.hasTag("preprocessing") ? "Extracting the brick..." : "" +
                  state.hasTag("detecting") ? "Detecting the brick..." : ""} color="#fff" scale={0.7} />
              </View>
            }
            {state.hasTag("scanning") && <Mask />}
          </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black"
  },
  overlayContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 35
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 20
  },
  detectedContainer: {
    flexGrow: 1,
    alignItems: "center",
    // justifyContent: "flex-start"
  },
  maskContainer: {
    flexGrow: 0,
    alignItems: "center",
    justifyContent: "center",
    // width: 200,
    height: 200
  },
});
