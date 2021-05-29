import React from "react";
import { Camera } from "expo-camera";
import { useRequestPermission } from "../../machines/permission.machine";
import { ScanBrick } from "./ScanBrick";
import { MissingCameraPermission } from "./MissingCameraPermission";
import { ActivityIndicator } from "react-native";

export default function ScanScreen() {
  const {
    isChecking: isCheckingCameraPermission,
    hasPermission: hasCameraPermission,
    checkPermission: rerequestCameraPermission,
  } = useRequestPermission(() =>
    Camera.requestPermissionsAsync().then(({ status }) => status === "granted")
  );

  return isCheckingCameraPermission ? (
    <ActivityIndicator />
  ) : hasCameraPermission ? (
    <ScanBrick />
  ) : (
    <MissingCameraPermission requestPermission={rerequestCameraPermission} />
  );
}
