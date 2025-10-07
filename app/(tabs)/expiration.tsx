import ExpirationItems from '@/components/ExpirationItems';
import { Text, View } from '@/components/Themed';
import { expirationItems } from '@/data/ItemsList';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface ExpirationItem {
  id: string;
  name: string;
  expirationDate: string;
}

export default function ExpirationTabScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});

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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <View style={styles.container}>
        <Text style={styles.title}>🗓 Expiration Dates Tracker</Text>
        <Text style={styles.todayInfo}>
          {itemsExpiringToday.length > 0 
            ? `Expires today(${today}): ${itemsExpiringToday.map(item => item.name).join(', ')}`
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
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Avenir',
  },
  todayInfo: {
    fontSize: 16,
    color: '#666',
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