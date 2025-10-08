import React from "react";
import { StyleSheet, View, useWindowDimensions, } from "react-native";

export const ScanQrOverlay = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.scanView}>
      <View style={{
        position: 'absolute',
        left: width * 0.15,
        top: height * 0.30,
        width: width * 0.7,
        height: height * 0.3,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
        backgroundColor: 'transparent',
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
    scanView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
});

export default ScanQrOverlay;