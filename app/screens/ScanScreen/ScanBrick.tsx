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

const scanModel = createModel(
  {
    images: [] as string[],
    processedImages: [] as string[],
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
              onDone: "brick_detected",
              onError: "brick_not_detected",
            },
          },
          brick_detected: {
            // type: "final",
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
    },
    services: {
      takePicture: () =>
        cameraRef.current!.takePictureAsync({ base64: true, quality: 0 }).then(
          (result) => "data:image/jpg;base64," + result.base64),
      detectBrick: (context) => {
        return Promise.resolve()
      }
    },
  });

  // const image = `data:image/gif;base64,R0lGODlhPQBEAPeoAJosM//AwO/AwHVYZ/z595kzAP/s7P+goOXMv8+fhw/v739/f+8PD98fH/8mJl+fn/9ZWb8/PzWlwv///6wWGbImAPgTEMImIN9gUFCEm/gDALULDN8PAD6atYdCTX9gUNKlj8wZAKUsAOzZz+UMAOsJAP/Z2ccMDA8PD/95eX5NWvsJCOVNQPtfX/8zM8+QePLl38MGBr8JCP+zs9myn/8GBqwpAP/GxgwJCPny78lzYLgjAJ8vAP9fX/+MjMUcAN8zM/9wcM8ZGcATEL+QePdZWf/29uc/P9cmJu9MTDImIN+/r7+/vz8/P8VNQGNugV8AAF9fX8swMNgTAFlDOICAgPNSUnNWSMQ5MBAQEJE3QPIGAM9AQMqGcG9vb6MhJsEdGM8vLx8fH98AANIWAMuQeL8fABkTEPPQ0OM5OSYdGFl5jo+Pj/+pqcsTE78wMFNGQLYmID4dGPvd3UBAQJmTkP+8vH9QUK+vr8ZWSHpzcJMmILdwcLOGcHRQUHxwcK9PT9DQ0O/v70w5MLypoG8wKOuwsP/g4P/Q0IcwKEswKMl8aJ9fX2xjdOtGRs/Pz+Dg4GImIP8gIH0sKEAwKKmTiKZ8aB/f39Wsl+LFt8dgUE9PT5x5aHBwcP+AgP+WltdgYMyZfyywz78AAAAAAAD///8AAP9mZv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAKgALAAAAAA9AEQAAAj/AFEJHEiwoMGDCBMqXMiwocAbBww4nEhxoYkUpzJGrMixogkfGUNqlNixJEIDB0SqHGmyJSojM1bKZOmyop0gM3Oe2liTISKMOoPy7GnwY9CjIYcSRYm0aVKSLmE6nfq05QycVLPuhDrxBlCtYJUqNAq2bNWEBj6ZXRuyxZyDRtqwnXvkhACDV+euTeJm1Ki7A73qNWtFiF+/gA95Gly2CJLDhwEHMOUAAuOpLYDEgBxZ4GRTlC1fDnpkM+fOqD6DDj1aZpITp0dtGCDhr+fVuCu3zlg49ijaokTZTo27uG7Gjn2P+hI8+PDPERoUB318bWbfAJ5sUNFcuGRTYUqV/3ogfXp1rWlMc6awJjiAAd2fm4ogXjz56aypOoIde4OE5u/F9x199dlXnnGiHZWEYbGpsAEA3QXYnHwEFliKAgswgJ8LPeiUXGwedCAKABACCN+EA1pYIIYaFlcDhytd51sGAJbo3onOpajiihlO92KHGaUXGwWjUBChjSPiWJuOO/LYIm4v1tXfE6J4gCSJEZ7YgRYUNrkji9P55sF/ogxw5ZkSqIDaZBV6aSGYq/lGZplndkckZ98xoICbTcIJGQAZcNmdmUc210hs35nCyJ58fgmIKX5RQGOZowxaZwYA+JaoKQwswGijBV4C6SiTUmpphMspJx9unX4KaimjDv9aaXOEBteBqmuuxgEHoLX6Kqx+yXqqBANsgCtit4FWQAEkrNbpq7HSOmtwag5w57GrmlJBASEU18ADjUYb3ADTinIttsgSB1oJFfA63bduimuqKB1keqwUhoCSK374wbujvOSu4QG6UvxBRydcpKsav++Ca6G8A6Pr1x2kVMyHwsVxUALDq/krnrhPSOzXG1lUTIoffqGR7Goi2MAxbv6O2kEG56I7CSlRsEFKFVyovDJoIRTg7sugNRDGqCJzJgcKE0ywc0ELm6KBCCJo8DIPFeCWNGcyqNFE06ToAfV0HBRgxsvLThHn1oddQMrXj5DyAQgjEHSAJMWZwS3HPxT/QMbabI/iBCliMLEJKX2EEkomBAUCxRi42VDADxyTYDVogV+wSChqmKxEKCDAYFDFj4OmwbY7bDGdBhtrnTQYOigeChUmc1K3QTnAUfEgGFgAWt88hKA6aCRIXhxnQ1yg3BCayK44EWdkUQcBByEQChFXfCB776aQsG0BIlQgQgE8qO26X1h8cEUep8ngRBnOy74E9QgRgEAC8SvOfQkh7FDBDmS43PmGoIiKUUEGkMEC/PJHgxw0xH74yx/3XnaYRJgMB8obxQW6kL9QYEJ0FIFgByfIL7/IQAlvQwEpnAC7DtLNJCKUoO/w45c44GwCXiAFB/OXAATQryUxdN4LfFiwgjCNYg+kYMIEFkCKDs6PKAIJouyGWMS1FSKJOMRB/BoIxYJIUXFUxNwoIkEKPAgCBZSQHQ1A2EWDfDEUVLyADj5AChSIQW6gu10bE/JG2VnCZGfo4R4d0sdQoBAHhPjhIB94v/wRoRKQWGRHgrhGSQJxCS+0pCZbEhAAOw==`


  // useEffect(() => {
  //   setTimeout(() => {
  //     cameraRef.current!.getSupportedRatiosAsync().then(console.log)
  //     cameraRef.current!.getAvailablePictureSizesAsync("1:1").then(console.log)
  //   }, 3000);
  // })

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
          {/* <Text style={styles.text}>
            Picture Uris:{" "}
            {JSON.stringify(
              state.context.uris.map((uri) => uri.split("/").pop()),
              null,
              2
            )}
          </Text> */}
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
