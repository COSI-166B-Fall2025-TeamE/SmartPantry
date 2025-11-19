import Ionicons from '@expo/vector-icons/build/Ionicons';
import { CameraView } from "expo-camera";
import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ScanQrOverlay from "./overlay";

export default function Scan() {
  const [isLoading, setIsLoading] = useState(false);
  const isScanning = useRef(false);

  useEffect(() => {
    isScanning.current = false;
  }, []);


  const resetScanner = () => {
    isScanning.current = false;
    setIsLoading(false);
  };

  const fetchProductInfo = async (barcode: string) => {
    setIsLoading(true);

    try {
      const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (json.status === 1 && json.product) {
        const productName = json.product.product_name || 'Name not found';
        console.log(json)
        Alert.alert(
          'Product Found!',
          productName,
          [
            {
              text: "Add to Pantry",
              onPress: () => router.push(`/pantry?openModal=true&itemName=${productName}`)
            },
            { 
              text: 'Scan a Different Item', 
              onPress: resetScanner
            },
            { 
              text: 'Back Home', 
              onPress: () => router.replace('/') 
            }
          ]
        );
      } else {
        Alert.alert(
          'Product Not Found',
          'This barcode was not found in the Open Food Facts database.',
          [
            { 
              text: 'Scan Another', 
              onPress: resetScanner 
            } 
          ]
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert(
        'API Error',
        'Failed to fetch product data. Please check your connection.',
        [
          { 
            text: 'Scan Another', 
            onPress: resetScanner
          }
        ]
      );
    }
  };

  const handleScan = ({ data }: { data: string }) => {
    if (isScanning.current) {
      return;
    }
    isScanning.current = true; 
    console.log("data", data);
    fetchProductInfo(data); 
  };

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
            
            barcodeScannerSettings={{
              barcodeTypes: [
                "ean13",
                "ean8",
                "upc_a",
                "upc_e"
              ],
            }}
            
            onBarcodeScanned={handleScan}
          />
          <ScanQrOverlay />

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#000000" /> 
          </TouchableOpacity>


          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, 
  },
  backButton: {
    position: 'absolute',
    top: 60, 
    left: 20,
    
    backgroundColor: '#CDD0E3', 
    padding: 10,
    borderRadius: 50, 
    zIndex: 10, 
  }
});