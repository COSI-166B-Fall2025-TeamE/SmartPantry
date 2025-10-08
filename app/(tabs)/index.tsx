import { Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/globalStyles';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


type FoodItem = {
  id: string;
  name: string;
  expirationDate: string;
}

export default function TabOneScreen() {

  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  const [items] = useState<FoodItem[]>([
  { id: '1', name: 'Bananas', expirationDate: '09/30/2025' },
  { id: '2', name: 'Milk', expirationDate: '10/08/2025' },
  { id: '3', name: 'Bread', expirationDate: '10/10/2025' },
  ]);

  const userName = 'Promise';
  const currentDate = 'SEPTEMBER 29, 2025';

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
          
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person" size={24} color="#4A4A4A" />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.container}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, <Text style={styles.userName}>{userName}!</Text>
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Scan Barcode Card */}
        <Pressable style={styles.scanCard} onPress={requestPermission} disabled={isPermissionGranted}>
          <View style={[styles.scanContent, { backgroundColor: Colors.primaryCard }]}>
            <View style={{ backgroundColor: Colors.primaryCard }}>
              <Text style={styles.scanTitle}>Scan A Barcode</Text>
              <Text style={styles.scanSubtitle}>
                Get started with a quick{'\n'}scan of an item near you.
              </Text>
            </View>
            <View style={[styles.barcodeIcon, { backgroundColor: Colors.primaryCard }]}>
              <View style={[styles.cornerTL, { backgroundColor: Colors.primaryCard }]} />
              <View style={[styles.cornerTR, { backgroundColor: Colors.primaryCard }]} />
              <View style={styles.barcodeLine} />
              <View style={[styles.cornerBL, { backgroundColor: Colors.primaryCard }]} />
              <View style={[styles.cornerBR, { backgroundColor: Colors.primaryCard }]} />
            </View>
          </View>
        </Pressable>
                {isPermissionGranted && (
                  <Link href="/scan" asChild>
                    <Pressable>
                      <Text style={styles.linkText}>CONTINUE SCANNING.</Text>
                    </Pressable>
                  </Link>
                )}

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>OR</Text>
        </View>
        
        {/* Manual Entry Button */}
        <TouchableOpacity style={styles.manualButton}>
          <View style={styles.manualButtonTextContainer}>
            <Text style={styles.manualButtonText}>Enter Items Manually</Text>
          </View>
          <View style={styles.manualButtonIconContainer}>
            <Ionicons name="finger-print-outline" size={28} color={Colors.secondaryText} />
          </View>
        </TouchableOpacity>

        {/* Expiring Soon Section */}
        <View style={styles.expiringSoonHeader}>
          <Text style={styles.expiringSoonTitle}>Expiring Soon</Text>
          <Text style={styles.itemCount}>{items.length} items</Text>
        </View>

        {/* Food Items Grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.itemsScroll}
          contentContainerStyle={styles.itemsContainer}
        >
          {items.map((item) => (
            <View key={item.id} style={styles.foodCard}>
              <View style={styles.foodImagePlaceholder} />
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDate}>{item.expirationDate}</Text>
            </View>
          ))}
        </ScrollView>
          <EditScreenInfo path="app/(tabs)/index.tsx" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },


  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
    backgroundColor: Colors.background,
  },

  menuButton: {
    padding: 8,
  },
  
  menuIcon: {
    width: 24,
    height: 20,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: Colors.mainText,
    borderRadius: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.mainText,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '400',
    color: Colors.mainText,
    marginBottom: 8,
  },
  userName: {
    fontWeight: '600',
    color: Colors.mainText,
  },
  dateText: {
    fontSize: 16,
    color: Colors.secondaryText,
    letterSpacing: 1,
    fontWeight: '500',
  },

  // Scan Barcode Section
  scanCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: Colors.primaryCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.mainText,
    padding: 24,
  },
  barcodeCard: {
    backgroundColor: Colors.primaryCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.mainText,
    padding: 24,
  },
  scanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 28,
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.mainText,
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  barcodeIcon: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.mainText,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.mainText,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.mainText,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.mainText,
    borderBottomRightRadius: 4,
  },
  barcodeLine: {
    width: 50,
    height: 4,
    backgroundColor: Colors.mainText,
    borderRadius: 2,
  },
  linkText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.linkText,
  },


  // OR Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 10,
    backgroundColor: 'transparent',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#A8A8A8',
    fontWeight: '600',
  },


  // Manual Entry Section
    manualButton: {
    backgroundColor: Colors.secondaryCard,
    marginHorizontal: 24,

    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.mainText,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },

  manualButtonTextContainer: {
    backgroundColor: Colors.secondaryCard,
  },

  manualButtonIconContainer: {
    backgroundColor: Colors.secondaryCard,
  },

  manualButtonText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    color: Colors.mainText,
  },

  // Expiring Soon Section
  expiringSoonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: 'transparent',
    gap: 160,
  },
  expiringSoonTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.mainText,
  },
  itemCount: {
    fontSize: 16,
    color: Colors.highlightText,
  },
  itemsScroll: {
    paddingLeft: 24,
  },
  itemsContainer: {
    paddingRight: 24,
    paddingBottom: 16,
  },
  foodCard: {
    width: 140,
    marginRight: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  foodImagePlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: Colors.primaryCard,
    borderRadius: 16,
    marginBottom: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.mainText,
    marginBottom: 4,
  },
  foodDate: {
    fontSize: 14,
    color: Colors.secondaryText,
  },

});
