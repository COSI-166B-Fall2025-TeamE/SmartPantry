import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/globalStyles';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useState } from 'react'; //
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


import EditScreenInfo from '@/components/EditScreenInfo';
import { expirationItems } from '@/data/ItemsList';




interface Item  {
  id: string;
  name: string;
  expirationDate: string;
}

export default function TabOneScreen() {

  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  //const [items] = useState<FoodItem[]>([
  //{ id: '1', name: 'Bananas', expirationDate: '09/30/2025' },
  //{ id: '2', name: 'Milk', expirationDate: '10/08/2025' },
  //{ id: '3', name: 'Bread', expirationDate: '10/10/2025' },
  //]);

  const [items, setItems] = useState<Item[]>([]);

  //const userNames = [
  //'Alex', 'Bailey', 'Casey', 'Drew', 'Emery', 'Finley', 'Harley', 'Indigo',
  //'Jamie', 'Kai', 'Logan', 'Morgan', 'Noah', 'Parker', 'Quinn', 'Riley',
  //'Sage', 'Taylor', 'Jordan', 'Avery', 'Reese', 'Skyler', 'Phoenix', 'River', 'Emerson'
  //];
  //const userName = userNames[Math.floor(Math.random() * userNames.length)];

  //const userName = 'Promise';
  const userName = 'User';
  const months = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];
  const now = new Date();
  const currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  //const currentDate = 'SEPTEMBER 29, 2025';

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setIsSidebarVisible(true)}
        >
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
        {isSidebarVisible && (
            <TouchableOpacity 
              style={styles.sidebarOverlay}
              onPress={() => setIsSidebarVisible(false)}
              activeOpacity={1}
            >
              <View style={styles.sidebar} onStartShouldSetResponder={() => true}>
                <View style={styles.sidebarHeader}>
                  <Text style={styles.sidebarTitle}>Menu</Text>
                  <TouchableOpacity 
                    style={styles.sidebarCloseButton}
                    onPress={() => setIsSidebarVisible(false)}
                  >
                    <Text style={styles.sidebarCloseText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.sidebarContent}>
                  <TouchableOpacity style={styles.sidebarItem}
                  onPress={() => setIsSidebarVisible(false)}
                  >
                    <Text style={styles.sidebarItemText}>Home</Text>
                  </TouchableOpacity>
                  
                 <Link href="/expiration" asChild>
                    <TouchableOpacity 
                      style={styles.sidebarItem}
                      onPress={() => setIsSidebarVisible(false)}
                    >
                      <Text style={styles.sidebarItemText}>Expiration Dates</Text>
                    </TouchableOpacity>
                  </Link>
                  
                  <Link href="/grocery" asChild>
                  <TouchableOpacity 
                      style={styles.sidebarItem}
                      onPress={() => setIsSidebarVisible(false)}
                    >
                    <Text style={styles.sidebarItemText}>Grocery List</Text>
                  </TouchableOpacity>
                  </Link>
                  
                  <TouchableOpacity 
                    style={styles.sidebarItem}
                    onPress={async () => {
                      try {
                        const storedItems = await AsyncStorage.getItem('groceryList');
                        if (storedItems) {
                          const items = JSON.parse(storedItems);
                          const itemsList = items.map((item: any) => `• ${item.text}${item.completed ? ' (completed)' : ''}`).join('\n');
                          alert(`Grocery List:\n\n${itemsList || 'No items'}`);
                        } else {
                          alert('Grocery list is empty');
                        }
                      } catch (error) {
                        alert('Failed to load grocery list');
                      }
                      setIsSidebarVisible(false);
                    }}
                  >
                    <Text style={styles.sidebarItemText}>Show current shopping list</Text>
                  </TouchableOpacity>

                  <Link href="/grocery" asChild>
                  <TouchableOpacity 
                      style={styles.sidebarItem}
                      onPress={() => setIsSidebarVisible(false)}
                    >
                    <Text style={styles.sidebarItemText}>Recipes</Text>
                  </TouchableOpacity>
                  </Link>
                  
                  <TouchableOpacity style={styles.sidebarItem}>
                    <Text style={styles.sidebarItemText}>Help</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        
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
        <Text style={styles.itemCount}>{(expirationItems && expirationItems.length) || 0} items</Text>
      </View>
      
      {/* Food Items Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsContainer}
      >
        {expirationItems && expirationItems.length > 0 ? (
          expirationItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemImagePlaceholder} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDate}>{item.expirationDate}</Text>
          </View>
          ))
        ) : (
          <View style={[styles.foodCard, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: Colors.secondaryText }}>No items found</Text>
          </View>
        )}
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
  width: '100%',
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
    minHeight: 200,
  },
  itemsContainer: {
    paddingRight: 24,
    paddingBottom: 16,
    minHeight: 200,
  },

  itemContainer: {
  width: 130,
  height: 180,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  marginRight: 16,
  padding: 12,
  alignItems: 'center',
  justifyContent: 'flex-start',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  },

  itemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },

  itemDate: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
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

  //styles for the side
  sidebarOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  flex: 1,
},

sidebar: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 280,
  height: '100%',
  backgroundColor: '#FFFFFF',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  zIndex: 1001,
},

sidebarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
  backgroundColor: Colors.primaryCard,
},

  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.mainText,
  },

  sidebarCloseButton: {
    padding: 5,
  },

  sidebarCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.mainText,
  },

  sidebarContent: {
    padding: 10,
  },

  sidebarItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  sidebarItemText: {
    fontSize: 16,
    color: Colors.mainText,
  },

});
