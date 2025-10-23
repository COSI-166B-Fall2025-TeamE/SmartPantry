import { fetchAllData } from '@/components/DatabaseFunctions';
import ExpirationItems from '@/components/ExpirationItems';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface ExpirationItem {
  id: string;
  name: string;
  expirationDate: string;
}

export default function ExpirationTabScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({}); //mark the dates selected
  const [showSearch, setShowSearch] = useState<boolean>(false); // control the search bar display
  const [searchQuery, setSearchQuery] = useState<string>('');   // search for the key name
  const [searchResults, setSearchResults] = useState<ExpirationItem[]>([]);

  const today = new Date().toISOString().split('T')[0];
  var itemsExpiringToday = [];
  

  const [expirationItems, setItems] = useState([]);

  // Fetch all items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {

    itemsExpiringToday = expirationItems.filter(item => item.expirationDate === today);
    console.log("itemsExpiringToday", itemsExpiringToday)

    const newMarkedDates: {[date: string]: any} = {};
    
    expirationItems.forEach(item => {
      const date = item.expirationDate;
      if (!newMarkedDates[date]) {
        newMarkedDates[date] = {
          dots: [{ key: item.id, color: '#FF6B6B' }],
          marked: true
        };
      } else {
        newMarkedDates[date].dots.push({ key: item.id, color: '#FF6B6B' });
      }
    });

    setMarkedDates(newMarkedDates);
  }, [expirationItems]);


  const loadItems = async () => {
    const result = await fetchAllData('expiration');
    if (result.success) {
      setItems(result.data);
      // console.log('Items loaded:', result.data);
    } else {
      console.error('Error loading items:', result.error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = expirationItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]); 

  const handleDayPress = (day: any) => {
    console.log('Selected day:', day.dateString);
    setSelectedDate(day.dateString);
  };

  const handleItemPress = (item: ExpirationItem) => {
    Alert.alert(
      'Item Details',
      `Name: ${item.name}\nExpiration Date: ${item.expirationDate}`,
      [{ text: 'OK' }]
    );
  };

  const handleScreenPress = () => {
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery('');
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.flexContainer} 
        onPress={handleScreenPress}
      >
      <View style={styles.header}>
          <Text style={styles.title}>🗓 Expiration Dates Tracker</Text>
          <TouchableOpacity 
              style={styles.searchIcon} 
              onPress={(e) => {
                e.stopPropagation(); 
                setShowSearch(!showSearch);
              }}
            >
              <Ionicons name="search" size={24} color="gray" />
          </TouchableOpacity>      
      </View>

      {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                <ScrollView>
                  {searchResults.map(item => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.searchResultItem}
                      onPress={() => handleItemPress(item)}
                    >
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultDate}>Expires: {item.expirationDate}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {searchQuery.trim() !== '' && searchResults.length === 0 && (
              <View style={styles.searchResults}>
                <Text style={styles.noResults}>No items found</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.todayInfo}>
          {expirationItems.filter(item => item.expirationDate === today).length > 0 
            ? <>
                Expires today ({today}): 
                {expirationItems.filter(item => item.expirationDate === today).map((item, index) => (
                  <Text key={item.id}>
                    {index > 0 && ', '}
                    <Text style={styles.boldItemName}>{item.name}</Text>
                  </Text>
                ))}
              </>
            : 'No items expire today'}
        </Text>
        <Text style={styles.instruction}>*there are things that will expire on dates with dots</Text>
        <View style={styles.separator} lightColor="#ddd" darkColor="rgba(255,255,255,0.2)" />

        <ScrollView>
        {/* Calendar Section with Marked Dates */}
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#00adf5',
            }
          }}
          markingType={'multi-dot'}
          theme={{
            selectedDayBackgroundColor: '#00adf5',
            todayTextColor: '#00adf5',
            arrowColor: 'grey',
          }}
        />

        {/* Enhanced Item Display */}
        <View style={styles.itemsContainer}>
          <Text style={[styles.sectionTitle, styles.expireTitle]}>
            {selectedDate 
              ? `Items expiring on ${selectedDate}` 
              : 'Select a date to see expiring items'}
          </Text>
          
          <ScrollView style={styles.itemsList}>
            <ExpirationItems 
              selectedDate={selectedDate} 
              onItemPress={handleItemPress} 
            />
          </ScrollView>
        </View> 
        
        <View style={styles.allItemsContainer}>
          <Text style={[styles.sectionTitle, styles.leftAlignTitle]}>All Expiring Items</Text>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={true}
            style={styles.allItemsList}
            contentContainerStyle={styles.allItemsContentContainer}
          >
            {expirationItems
              .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
              .map((item) => (
                <View key={item.id} style={styles.allItemCard}>
                  <Text style={styles.allItemName}>{item.name}</Text>
                  <Text style={styles.allItemDate}>Expires: {item.expirationDate}</Text>
                </View>
              ))}
          </ScrollView>
        </View>
        </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Avenir',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  } ,
  searchIcon: {
    padding: 10,
  },
  searchContainer: {
    width: '90%',
    maxWidth: 400,
    marginTop: 10,
    position: 'relative',
    alignSelf: 'center',
  },
   flexContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchResults: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 10,
  },
  searchResultItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultDate: {
    fontSize: 14,
    color: 'gray',
  },
  noResults: {
    padding: 10,
    textAlign: 'center',
    color: 'gray',
  },
  todayInfo: {
    fontSize: 16,
    color: '#1b6cceff',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 12,
    color: '#f38627ff'
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
  },
  itemsContainer: {
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Avenir',
    marginBottom: 10,
    textAlign: 'center',
  },
  expireTitle:{
    color:'#1d476eff'
  },
   boldItemName: {
    fontSize: 18, 
    fontWeight: 'bold',
  },
  itemsList: {
    minHeight: 120,
  },
  leftAlignTitle: {
    textAlign: 'left',
  },
   allItemsContainer: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 5,
    marginBottom: 20,
  },
  allItemsList: {
    maxHeight: 200,
  },
  allItemCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#423f3fff',
  },
  allItemsContentContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  allItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  allItemDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});