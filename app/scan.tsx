import { CameraView } from "expo-camera";
import { Stack } from "expo-router";
import {
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ScanQrOverlay from "./overlay";


export default function Scan() {
  return (
        <SafeAreaView style={StyleSheet.absoluteFillObject}>
          <Stack.Screen
            options={{
              title: "Scan",
              headerShown: false,
            }}
          />
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={({ data }) => {
              console.log("data", data);
              Linking.openURL(data);
            }}
          />
          <ScanQrOverlay />
        </SafeAreaView>
  );
}