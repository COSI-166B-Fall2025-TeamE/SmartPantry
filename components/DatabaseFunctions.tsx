import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://lmjsnvqjntyyorvmxyib.supabase.co"
const supabaseKey = "sb_publishable_aeWD6oACdSDgfqi4csNVwA_FwYORzpU"


// ==================== RETRIEVE DATA ====================

/**
 * Fetch all data from a table
 * @param tableName - Name of the table to query
 * @returns Object with success status and data or error
 */
export const fetchAllData = async (tableName: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user){
      console.log("Current User: " , user.user_metadata.display_name)
    }
    else{
      console.log("Current User: ", user)
    }
    
    if (user){
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
      if (error) throw error;
      console.log(`Data fetched from ${tableName}`);
      return { success: true, data};
    }
    else {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .is('user_id', null); // Filter where 'user_id' is null;
      if (error) throw error;
      console.log(`Data fetched from ${tableName}`);
      return { success: true, data};      
    }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching data from ${tableName}:`, err);
    return { success: false, error: errorMessage };
  }
};

// ==================== INSERT DATA ====================

/**
 * Insert data into a table
 * @param tableName - Name of the table to insert into
 * @param dataToInsert - Object or array of objects to insert
 * @returns Object with success status and inserted data or error
 */
export const insertData = async (tableName: string, dataToInsert: any, session: Session) => {
  try {
    dataToInsert["user_id"] = session && session.user ? session.user.user_metadata.sub : null

    const { data, error } = await supabase
      .from(tableName)
      .insert([dataToInsert])
      .select();

    if (error) throw error;

    console.log(`Data inserted into ${tableName}:`, data);
    return { success: true, data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error inserting data into ${tableName}:`, err);
    return { success: false, error: errorMessage };
  }
};

// ==================== DELETE DATA ====================

/**
 * Delete data by ID
 * @param tableName - Name of the table to delete from
 * @param id - ID of the row to delete
 * @returns Object with success status or error
 */
export const deleteById = async (tableName: string, id: string) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log(`Row deleted from ${tableName} with id: ${id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error deleting data from ${tableName}:`, err);
    return { success: false, error: errorMessage };
  }
};


// ==================== UPDATE DATA ====================

/**
 * Update data by ID
 * @param tableName - Name of the table to update
 * @param id - ID of the row to update
 * @param updateData - Object with fields to update
 * @returns Object with success status and updated data or error
 */
export const updateById = async (tableName: string, id: string, updateData: any) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    console.log(`Data updated in ${tableName}:`, data);
    return { success: true, data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error updating data in ${tableName}:`, err);
    return { success: false, error: errorMessage };
  }
};


// ==================== EXAMPLE USAGE FROM ANOTHER FILE ====================

/*
// In your component file (e.g., ExpirationScreen.tsx):

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { 
  fetchAllData, 
  insertData, 
  updateById, 
  deleteById,
  fetchDataWithSort 
} from './supabaseFunctions'; // Adjust path as needed

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

  // Update an existing item
  const updateItem = async (id) => {
    const result = await updateById('expiration', id, { 
      name: 'Fresh Milk' 
    });
    
    if (result.success) {
      console.log('Item updated:', result.data);
      loadItems(); // Refresh the list
    } else {
      console.error('Error updating item:', result.error);
    }
  };

  // Delete an item
  const removeItem = async (id) => {
    const result = await deleteById('expiration', id);
    
    if (result.success) {
      console.log('Item deleted');
      loadItems(); // Refresh the list
    } else {
      console.error('Error deleting item:', result.error);
    }
  };

  // Fetch items sorted by date
  const loadSortedItems = async () => {
    const result = await fetchDataWithSort('expiration', 'date', true);
    if (result.success) {
      setItems(result.data);
    }
  };

  return (
    <View>
      <Text>Expiration Items: {items.length}</Text>
      <Button title="Add Item" onPress={addNewItem} />
      <Button title="Load Sorted" onPress={loadSortedItems} />
    </View>
  );
};

export default ExpirationScreen;
*/