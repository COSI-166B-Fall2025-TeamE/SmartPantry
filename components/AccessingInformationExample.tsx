
// In your component file (e.g., ExpirationScreen.tsx):

import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
    deleteById,
    fetchAllData,
    insertData,
} from './DatabaseFunctions'; // Adjust path as needed

const ExpirationScreen = () => {
  const [items, setItems] = useState([]);

  // Fetch all items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const result = await fetchAllData('expiration');
    if (result.success) {
      setItems(result.data);
      console.log('Items loaded:', result.data);
    } else {
      console.error('Error loading items:', result.error);
    }
  };

  // Add a new item
  const addNewItem = async () => {
    const result = await insertData('expiration', { 
      name: 'Milk', 
      date: '2025-12-31' 
    });
    
    if (result.success) {
      console.log('Item added:', result.data);
      loadItems(); // Refresh the list
    } else {
      console.error('Error adding item:', result.error);
    }
  };

  // Delete an item
  const removeItem = async (id: any) => {
    const result = await deleteById('expiration', id);
    
    if (result.success) {
      console.log('Item deleted');
      loadItems(); // Refresh the list
    } else {
      console.error('Error deleting item:', result.error);
    }
  };

  return (
    <View>
      <Text>Expiration Items: {items.length}</Text>
      <Button title="Add Item" onPress={addNewItem} />
      <Button title="Load Items" onPress={loadItems} />
    </View>
  );
};

export default ExpirationScreen;