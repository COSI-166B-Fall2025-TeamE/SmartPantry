import { CameraView } from "expo-camera";
import { Stack, router } from "expo-router";
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ScanQrOverlay from "./overlay";
import { useState, useRef, useEffect } from "react"; // <-- Import useRef and useEffect

export default function Scan() {
  // We'll keep isLoading for the spinner
  const [isLoading, setIsLoading] = useState(false);
  
  // This ref will track if we are *currently* processing a scan
  // This is better than state because it updates instantly.
  const isScanning = useRef(false); // <-- ADD THIS

  // This function will re-enable scanning when the user navigates back to the screen
  useEffect(() => {
    // This is optional, but good practice.
    // When the screen comes into focus, reset the scanner.
    isScanning.current = false;
  }, []);


  const resetScanner = () => {
    isScanning.current = false; // <-- Reset the ref
    setIsLoading(false);
  };

  // This function calls the Open Food Facts API
  const fetchProductInfo = async (barcode: string) => {
    setIsLoading(true);

    try {
      const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (json.status === 1 && json.product) {
        const productName = json.product.product_name || 'Name not found';
        
        Alert.alert(
          'Product Found!',
          productName,
          [
            { 
              text: 'Scan Another', 
              onPress: resetScanner // <-- Use resetScanner
            },
            { 
              text: 'Back Home', 
              onPress: () => router.replace('/') 
              // We don't need to reset here since we are leaving the screen
            }
          ]
        );
      } else {
        // Product not found
        Alert.alert(
          'Product Not Found',
          'This barcode was not found in the Open Food Facts database.',
          [
            { 
              text: 'Scan Another', 
              onPress: resetScanner // <-- Use resetScanner
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
            onPress: resetScanner // <-- Use resetScanner
          }
        ]
      );
    } finally {
      // Don't set isLoading(false) here, let the alert reset it
      // so the scanner doesn't turn on *behind* the alert.
      // We'll let the alert's onPress handle it.
      
      // We will set loading to false *only if* the alert logic fails
      // for some reason, but in most cases, the alert handles it.
      if (isLoading) {
         // This is a safety fallback. The alert should handle it.
         // Let's rely on the alert buttons instead.
      }
    }
  };

  // --- THIS IS THE UPDATED HANDLER ---
  const handleScan = ({ data }: { data: string }) => {
    // 1. Check the ref. If it's true, we're already scanning. Stop!
    if (isScanning.current) {
      return;
    }

    // 2. Set the ref to true IMMEDIATELY.
    isScanning.current = true; 
    
    // 3. Now, proceed with the fetch
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
            
            // --- THIS IS THE FIX ---
            // We just pass the handleScan function directly.
            // The logic to stop multiple scans is now *inside* handleScan.
            onBarcodeScanned={handleScan}
            // --- END OF FIX ---
          />
          <ScanQrOverlay />

          {/* Loading overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </SafeAreaView>
  );
}

// Add the styles for the loading overlay
const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});