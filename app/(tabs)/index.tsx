import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useCameraPermissions } from 'expo-camera';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import EditScreenInfo from '@/components/EditScreenInfo';
import { expirationItems } from '@/data/ItemsList';


interface Item  {
  id: string;
  name: string;
  expirationDate: string;
}


export default function TabOneScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [permission, requestPermission] = useCameraPermissions();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const userName = 'User';
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const now = new Date();
  const currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const handleScanPress = async () => {
    let currentPermission = permission;
    
    if (!currentPermission?.granted) {
      currentPermission = await requestPermission();
    }
    
    if (currentPermission.granted) {
      router.push('/scan');
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
    }
  };

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setIsSidebarVisible(true)}
        >
          <View style={styles.menuIcon}>
            <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
            <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
            <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
            <View style={[styles.menuLine, { backgroundColor: colors.text }]} />
          </View>
        </TouchableOpacity>
          
        <TouchableOpacity style={[
          styles.profileButton,
          { 
            backgroundColor: colors.profileButton,
            borderColor: colors.text
          }
        ]}>
          <Ionicons 
            name="person" 
            size={24} 
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {isSidebarVisible && (
          <TouchableOpacity 
            style={styles.sidebarOverlay}
            onPress={() => setIsSidebarVisible(false)}
            activeOpacity={1}
          >
            <View style={[styles.sidebar, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
              <View style={[styles.sidebarHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.sidebarTitle, { color: colors.text }]}>Menu</Text>
                <TouchableOpacity 
                  style={styles.sidebarCloseButton}
                  onPress={() => setIsSidebarVisible(false)}
                >
                  <Text style={[styles.sidebarCloseText, { color: colors.text }]}>×</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.sidebarContent}>
                <TouchableOpacity 
                  style={[styles.sidebarItem, { borderBottomColor: colors.border }]}
                  onPress={() => setIsSidebarVisible(false)}
                >
                  <Text style={[styles.sidebarItemText, { color: colors.text }]}>Home</Text>
                </TouchableOpacity>
                
                <Link href="/expiration" asChild>
                  <TouchableOpacity 
                    style={[styles.sidebarItem, { borderBottomColor: colors.border }]}
                    onPress={() => setIsSidebarVisible(false)}
                  >
                    <Text style={[styles.sidebarItemText, { color: colors.text }]}>Expiration Dates</Text>
                  </TouchableOpacity>
                </Link>
                
                <Link href="/grocery" asChild>
                  <TouchableOpacity 
                    style={[styles.sidebarItem, { borderBottomColor: colors.border }]}
                    onPress={() => setIsSidebarVisible(false)}
                  >
                    <Text style={[styles.sidebarItemText, { color: colors.text }]}>Grocery List</Text>
                  </TouchableOpacity>
                </Link>
                
                <TouchableOpacity 
                  style={[styles.sidebarItem, { borderBottomColor: colors.border }]}
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
                  <Text style={[styles.sidebarItemText, { color: colors.text }]}>Show current shopping list</Text>
                </TouchableOpacity>

                <Link href="/recipe" asChild>
                  <TouchableOpacity 
                    style={[styles.sidebarItem, { borderBottomColor: colors.border }]}
                    onPress={() => setIsSidebarVisible(false)}
                  >
                    <Text style={[styles.sidebarItemText, { color: colors.text }]}>Recipes</Text>
                  </TouchableOpacity>
                </Link>
                
                <TouchableOpacity style={[styles.sidebarItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.sidebarItemText, { color: colors.text }]}>Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Welcome Message */}
        <View style={[styles.welcomeSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome back, <Text style={[styles.userName, { color: colors.text }]}>{userName}!</Text>
          </Text>
          <Text style={[styles.dateText, { color: colors.text, opacity: 0.7 }]}>{currentDate}</Text>
        </View>

        {/* Scan Barcode Card */}
        <Pressable 
          style={[
            styles.scanCard, 
            { 
              backgroundColor: colors.scanCard,
              borderColor: colors.text 
            }
          ]} 
          onPress={handleScanPress}
        >
          <View style={[
            styles.scanContent, 
            { backgroundColor: colors.scanCard }
          ]}>
            <View style={{ backgroundColor: colors.scanCard }}>
              <Text style={[styles.scanTitle, { color: colors.text }]}>Scan A Barcode</Text>
              <Text style={[styles.scanSubtitle, { color: colors.text, opacity: 0.7 }]}>
                Get started with a quick{'\n'}scan of an item near you.
              </Text>
            </View>
            <View style={[
              styles.barcodeIcon, 
              { backgroundColor: colors.scanCard }
            ]}>
              <View style={[
                styles.cornerTL, 
                { 
                  backgroundColor: colors.scanCard, 
                  borderColor: colors.text 
                }
              ]} />
              <View style={[
                styles.cornerTR, 
                { 
                  backgroundColor: colors.scanCard, 
                  borderColor: colors.text 
                }
              ]} />
              <View style={[styles.barcodeLine, { backgroundColor: colors.text }]} />
              <View style={[
                styles.cornerBL, 
                { 
                  backgroundColor: colors.scanCard, 
                  borderColor: colors.text 
                }
              ]} />
              <View style={[
                styles.cornerBR, 
                { 
                  backgroundColor: colors.scanCard, 
                  borderColor: colors.text 
                }
              ]} />
            </View>
          </View>
        </Pressable>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <Text style={[styles.dividerText, { color: colors.text, opacity: 0.5 }]}>OR</Text>
        </View>
        
        {/* Manual Entry Button */}
        <TouchableOpacity 
          style={[
            styles.manualButton, 
            { 
              backgroundColor: colors.manualCard,
              borderColor: colors.text 
            }
          ]}
        >
          <View style={[
            styles.manualButtonTextContainer, 
            { backgroundColor: colors.manualCard }
          ]}>
            <Text style={[styles.manualButtonText, { color: colors.text }]}>Enter Items Manually</Text>
          </View>
          <View style={[
            styles.manualButtonIconContainer, 
            { backgroundColor: colors.manualCard }
          ]}>
            <Ionicons 
              name="finger-print-outline" 
              size={28} 
              color={colors.text}
            />
          </View>
        </TouchableOpacity>

        
        {/* Expiring Soon Section */}
        <View style={styles.expiringSoonHeader}>
          <Text style={[styles.expiringSoonTitle, { color: colors.text }]}>Expiring Soon</Text>
          <Text style={[styles.itemCount, { color: colors.buttonBackground }]}>
            {(expirationItems && expirationItems.length) || 0} items
          </Text>
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
              <View 
                key={item.id} 
                style={[
                  styles.itemContainer, 
                  { backgroundColor: colors.expiringCard }
                ]}
              >
                <View style={[
                  styles.itemImagePlaceholder,
                  { 
                    backgroundColor: colorScheme === 'dark' ? colors.inputBackground : '#F0F0F0',
                    borderColor: colors.border
                  }
                ]} />
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemDate, { color: colors.text, opacity: 0.7 }]}>{item.expirationDate}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.foodCard, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: colors.text, opacity: 0.7 }}>No items found</Text>
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
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
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
    borderRadius: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '400',
    marginBottom: 8,
  },
  userName: {
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '500',
  },

  // Scan Barcode Section
  scanCard: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 2,
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
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
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
    borderBottomRightRadius: 4,
  },
  barcodeLine: {
    width: 50,
    height: 4,
    borderRadius: 2,
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
    fontWeight: '600',
  },

  // Manual Entry Section
  manualButton: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 28,
  },

  manualButtonTextContainer: {
    flex: 1,
  },

  manualButtonIconContainer: {
    backgroundColor: 'transparent',
  },

  manualButtonText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'left',
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
  },
  itemCount: {
    fontSize: 16,
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
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },

  itemDate: {
    fontSize: 13,
    textAlign: 'center',
  },

  foodCard: {
    width: 140,
    marginRight: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  // Sidebar styles
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
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  sidebarCloseButton: {
    padding: 5,
  },

  sidebarCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  sidebarContent: {
    padding: 10,
  },

  sidebarItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },

  sidebarItemText: {
    fontSize: 16,
  },
});
