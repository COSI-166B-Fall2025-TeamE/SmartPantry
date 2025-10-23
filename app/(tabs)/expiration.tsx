import ExpirationItems from '@/components/ExpirationItems';
import { Text, View } from '@/components/Themed';
import { expirationItems } from '@/data/ItemsList';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Colors from '@/constants/templateColors';

interface ExpirationItem {
  id: string;
  name: string;
  expirationDate: string;
}

export default function ExpirationTabScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ExpirationItem[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const itemsExpiringToday = expirationItems.filter(item => item.expirationDate === today);
  
  useEffect(() => {
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
  }, []);

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
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: colors.background }]} 
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.flexContainer, { backgroundColor: colors.background }]} 
          onPress={handleScreenPress}
        >
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Expiration Tracker</Text>
            <TouchableOpacity 
              style={styles.searchIcon} 
              onPress={(e) => {
                e.stopPropagation(); 
                setShowSearch(!showSearch);
              }}
            >
              <Ionicons 
                name="search" 
                size={24} 
                color={colorScheme === 'dark' ? '#8E8E93' : '#666'} 
              />
            </TouchableOpacity>      
          </View>

          <Text style={[styles.subtitle, { color: colors.text }]}>Track your food expiration dates</Text>

          {showSearch && (
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[
                  styles.searchInput,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text
                  }
                ]}
                placeholder="Search items..."
                placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchResults.length > 0 && (
                <View style={[styles.searchResults, { backgroundColor: colors.card }]}>
                  <ScrollView>
                    {searchResults.map(item => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.searchResultItem}
                        onPress={() => handleItemPress(item)}
                      >
                        <Text style={[styles.searchResultName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.searchResultDate, { color: colors.text, opacity: 0.7 }]}>
                          Expires: {item.expirationDate}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {searchQuery.trim() !== '' && searchResults.length === 0 && (
                <View style={[styles.searchResults, { backgroundColor: colors.card }]}>
                  <Text style={[styles.noResults, { color: colors.text, opacity: 0.7 }]}>No items found</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.todayContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.todayInfo, { color: colors.buttonBackground }]}>
              {itemsExpiringToday.length > 0 
                ? <>
                    Expires today ({today}): 
                    {itemsExpiringToday.map((item, index) => (
                      <Text key={item.id}>
                        {index > 0 && ', '}
                        <Text style={styles.boldItemName}>{item.name}</Text>
                      </Text>
                    ))}
                  </>
                : 'No items expire today'}
            </Text>
            <Text style={[styles.instruction, { color: colors.text, opacity: 0.6 }]}>
              *Dots indicate items expiring on that date
            </Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Calendar Section */}
            <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: {
                    ...(markedDates[selectedDate] || {}),
                    selected: true,
                    selectedColor: colors.buttonBackground,
                  }
                }}
                markingType={'multi-dot'}
                theme={{
                  backgroundColor: colors.background,
                  calendarBackground: colors.background,
                  textSectionTitleColor: colors.text,
                  selectedDayBackgroundColor: colors.buttonBackground,
                  selectedDayTextColor: colors.buttonText,
                  todayTextColor: colors.buttonBackground,
                  dayTextColor: colors.text,
                  textDisabledColor: colorScheme === 'dark' ? '#4A4E6B' : '#d9e1e8',
                  arrowColor: colors.buttonBackground,
                  monthTextColor: colors.text,
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>

            {/* Items expiring on selected date */}
            <View style={[styles.itemsContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Items expiring on {selectedDate}
              </Text>
              
              <View style={styles.itemsList}>
                <ExpirationItems 
                  selectedDate={selectedDate} 
                  onItemPress={handleItemPress} 
                />
              </View>
            </View> 
            
            {/* All items horizontal scroll */}
            <View style={[styles.allItemsContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>All Expiring Items</Text>
              <ScrollView 
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
                style={styles.allItemsList}
                contentContainerStyle={styles.allItemsContentContainer}
              >
                {expirationItems
                  .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
                  .map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.allItemCard, { backgroundColor: colors.card }]}
                      onPress={() => handleItemPress(item)}
                    >
                      <Text style={[styles.allItemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.allItemDate, { color: colors.text, opacity: 0.7 }]}>
                        {item.expirationDate}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 5,
    marginBottom: 15,
  },
  searchIcon: {
    position: 'absolute',
    right: 20,
    padding: 10,
  },
  searchContainer: {
    width: '90%',
    maxWidth: 400,
    marginBottom: 15,
    position: 'relative',
    zIndex: 10,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 0,
  },
  searchResults: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultItem: {
    padding: 15,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    borderBottomWidth: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultDate: {
    fontSize: 14,
    marginTop: 4,
  },
  noResults: {
    padding: 15,
    textAlign: 'center',
  },
  todayContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  todayInfo: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  boldItemName: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  calendarContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  itemsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemsList: {
    minHeight: 120,
  },
  allItemsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  allItemsList: {
    maxHeight: 200,
  },
  allItemsContentContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  allItemCard: {
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 150,
  },
  allItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  allItemDate: {
    fontSize: 13,
  },
});
