import { Camera } from "expo-camera";
import React from "react";
import { ActivityIndicator } from "react-native";
import { useRequestPermission } from "../../machines/permission.machine";
import { MissingCameraPermission } from "./MissingCameraPermission";
import { ScanBrick } from "./ScanBrick";

export default function ScanScreen() {
  const {
    isChecking: isCheckingCameraPermission,
    hasPermission: hasCameraPermission,
    checkPermission: rerequestCameraPermission,
  } = useRequestPermission(() =>
    Camera.requestPermissionsAsync().then(({ status }) => status === "granted")
  );

  return isCheckingCameraPermission
        ? <ActivityIndicator />
        :
    hasCameraPermission
        ? <ScanBrick />
        : <MissingCameraPermission requestPermission={rerequestCameraPermission} />;
}
