import { Text, View } from '@/components/Themed';
import { expirationItems } from '@/data/ItemsList';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Colors from '@/constants/templateColors';


interface ExpirationItem {
  id: string;
  name: string;
  expirationDate: string;
}


interface ExpirationItemsProps {
  selectedDate: string;
  onItemPress: (item: ExpirationItem) => void;
  items?: ExpirationItem[];
}


const ExpirationItems: React.FC<ExpirationItemsProps> = ({ selectedDate, onItemPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const filteredItems = selectedDate 
    ? expirationItems.filter(item => item.expirationDate === selectedDate)
    : [];


  return (
    <View style={styles.itemsSection}>
      {filteredItems.length > 0 ? (
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.itemCard,
                { backgroundColor: colors.selectedDateCard }
              ]}
              onPress={() => onItemPress(item)}
            >
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.itemDate, { color: colors.text, opacity: 0.7 }]}>{item.expirationDate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : selectedDate ? (
        <Text style={[styles.noItemsText, { color: colors.text, opacity: 0.5 }]}>No items expiring on this date</Text>
      ) : (
        <Text style={[styles.noItemsText, { color: colors.text, opacity: 0.5 }]}>Please select a date to view items</Text>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  itemsSection: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 14,
    marginTop: 5,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 20,
  },
});


export default ExpirationItems;
