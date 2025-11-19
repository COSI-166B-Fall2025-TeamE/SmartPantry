import Colors from '@/constants/templateColors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function InstructionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  // State for interactive examples
  const [itemName, setItemName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [groceryItem, setGroceryItem] = useState('');

  const handleAddItemExample = () => {
    if (itemName && expirationDate) {
      Alert.alert(
        'Success!',
        `Item "${itemName}" with expiration date ${expirationDate} would be added to your pantry.`,
        [{ text: 'OK' }]
      );
      setItemName('');
      setExpirationDate('');
    } else {
      Alert.alert('Missing Information', 'Please fill in both item name and expiration date.');
    }
  };

  const handleAddGroceryItem = () => {
    if (groceryItem) {
      Alert.alert(
        'Added to Grocery List!',
        `"${groceryItem}" has been added to your shopping list.`,
        [{ text: 'OK' }]
      );
      setGroceryItem('');
    } else {
      Alert.alert('Missing Information', 'Please enter a grocery item.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>App Instructions</Text>
        
        <Text style={[styles.subtitle]}>Home page</Text>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Welcome to SmartPantry!</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            SmartPantry helps you manage your pantry items efficiently, track expiration dates, 
            and discover recipes based on what you have at home.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.featureRow}>
            <Ionicons name="barcode-outline" size={24} color={colors.text} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Barcode Scanning</Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            Use your camera to scan product barcodes for quick entry. Simply tap "Scan A Barcode" 
            on the homepage and point your camera at any product barcode.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.featureRow}>
            <Ionicons name="hand-left-outline" size={24} color={colors.text} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Manual Entry</Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            Add items manually by entering their name and expiration date. Try the example below:
          </Text>
          
          <View style={[styles.exampleBox, { backgroundColor: colors.expiringCard, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Item Name (e.g. Milk)"
              placeholderTextColor={colors.text + '80'}
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Expiration Date (e.g. 2023-12-31)"
              placeholderTextColor={colors.text + '80'}
              value={expirationDate}
              onChangeText={setExpirationDate}
            />
            <TouchableOpacity
              style={[styles.exampleButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleAddItemExample}
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>Add Item Example</Text>
            </TouchableOpacity>
          </View>
        </View>

         <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.featureRow}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Expiration Alerts</Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            Never let food go to waste again! The "Expiring Soon" section on your homepage 
            highlights items that need attention.
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.featureRow}>
            <Ionicons name="restaurant-outline" size={24} color={colors.text} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Recipe Suggestions</Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            Get recipe ideas based on items nearing expiration. Tap on any expiring item card 
            on the homepage to see relevant recipes.
          </Text>
        </View>

        <Text style={[styles.subtitle]}>Tabs</Text>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.featureRow}>
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Grocery List</Text>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            Maintain a shopping list within the app. Access it anytime through the menu. Try adding an item:
          </Text>
          
          <View style={[styles.exampleBox, { backgroundColor: colors.expiringCard, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
              placeholder="Grocery Item (e.g. Eggs)"
              placeholderTextColor={colors.text + '80'}
              value={groceryItem}
              onChangeText={setGroceryItem}
            />
            <TouchableOpacity
              style={[styles.exampleButton, { backgroundColor: colors.buttonBackground }]}
              onPress={handleAddGroceryItem}
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>Add to Grocery List</Text>
            </TouchableOpacity>
          </View>
        </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.featureRow}>
          <Ionicons name="calendar-outline" size={24} color={colors.text} />
          <Text style={[styles.featureTitle, { color: colors.text }]}>Expiration Track</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>
          - It provides a clear calendar that visually displays items expiring today and in the coming days, with reminders.
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          - Also shows current inventory and let user to search.
        </Text>
        <Text style={[styles.importantText]}>
          Keep track of your items' expiration dates with our smart tracking system!
        </Text>

        <View style={[styles.exampleBox, { backgroundColor: colors.expiringCard, borderColor: colors.border }]}>
          <View style={styles.searchExampleContainer}>
            <TextInput
              style={[
                styles.searchInputExample,
                { 
                  color: colors.text, 
                  backgroundColor: colors.inputBackground,
                }
              ]}
              placeholder="Search items (e.g. milk, eggs)"
              placeholderTextColor={colors.text + '80'}
            />
            <TouchableOpacity
              style={styles.searchButtonExample}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.featureRow}>
          <Ionicons name="book-outline" size={24} color={colors.text} />
          <Text style={[styles.featureTitle, { color: colors.text }]}>Recipes</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>
          - Discover delicious recipes based on ingredients you already have.
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          - Add your favourites, or create your own recipes.
        </Text>
        <Text style={[styles.importantText]}>
          Our smart recipe suggestion engine helps reduce food waste while creating tasty meals!
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.featureRow}>
          <Ionicons name="archive-outline" size={24} color={colors.text} />
          <Text style={[styles.featureTitle, { color: colors.text }]}>My Pantry</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>
        - View and manage all your pantry items in one place. 
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
        - Scan and manually enter your pantry items.
        </Text>
        <Text style={[styles.importantText]}>
          Easily search, filter, and update your inventory to keep track of what you have at home.
        </Text>
      </View>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.buttonBackground }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Back to Homepage</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 20,
    color: '#A598A4',
    fontFamily:'Arial',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 34,
  },
  exampleBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  exampleButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  homeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  importantText: {
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 34,
    fontWeight: 'bold',
    color: '#430a65ff',
  },
  searchExampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  searchInputExample: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  
  searchButtonExample: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  
});