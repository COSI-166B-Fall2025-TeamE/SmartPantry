import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { fetchAllData } from './DatabaseFunctions';

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
  
  const [expirationItems, setItems] = useState([]);

  // Fetch all items on component mount
  useEffect(() => {
    loadItems();
  }, []);


  const [session, setSession] = useState<Session | null>(null)
    
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  
  const loadItems = async () => {
    const result = await fetchAllData('expiration', session);
    setItems(result.data);
  };
  
  
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
              style={styles.itemCard}
              onPress={() => onItemPress(item)}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDate}>{item.expirationDate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : selectedDate ? (
        <Text style={styles.noItemsText}>No items expiring on this date</Text>
      ) : (
        <Text style={styles.noItemsText}>Please select a date to view items</Text>
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
    backgroundColor: 'rgba(203, 230, 243, 0.5)',
    padding: 15,
    borderRadius: 10,
    borderColor: '#00adf5',
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',

  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#1d476eff'
  },
  itemDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
    noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default ExpirationItems;