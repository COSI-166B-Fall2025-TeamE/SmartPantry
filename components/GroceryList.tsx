import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { calculateRemainingExpiryDays, getExpiringSoonItems, getExpiryColorByDays } from '../data/expiryCalculator'; // Changed import
import { deleteById, fetchAllData, insertData, updateById } from './DatabaseFunctions';

type GroceryItem = {
  id: string;
  text: string;
  completed: boolean;
};





export default function GroceryList() {
  const [items, setItems] = useState<Array<GroceryItem>>([]);
  const [inputText, setInputText] = useState('');

  const [suggestions, setExpirationSuggestions] = useState([]);
  
  const loadItemsnew = async (currentGroceryItems) => {
    const result = await fetchAllData('expiration');
    if (result.success){
        //console.log('Expiration data from DB:', result.data);
        
        const updatedItems = result.data.map((item, index) => {
          if (!item.id) {
            console.warn('Item without ID found:', item);
          }
          
          return {
            ...item,
            id: item.id || item.name || `item_${index}_${Date.now()}`,
            name: item.name || 'Unknown Item',
            expiry: item.expirationDate,
            expiryDays: calculateRemainingExpiryDays(item.expirationDate, item.name || 'Unknown')
          };
        });

        //console.log('Processed items with IDs:', updatedItems);

        const currentItemTexts = currentGroceryItems.map(item => item.text.toLowerCase());
        const sortedFilteredItems = updatedItems.filter(
          suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase())
        ).sort((a, b) => a.expiryDays - b.expiryDays).slice(0, 4);

        setExpirationSuggestions(sortedFilteredItems)
    } else {
      console.error('Error loading items:', result.error);
    }
};



  // Fetch all items on component mount
  useEffect(() => {
    loadItemsnew(items);
  }, [items]);

  useEffect(() => {
    loadGroceryList()
  }, [])

  const loadGroceryList = async () => {
    const groceryResult = await fetchAllData('groceryList');
    sortItems(groceryResult.data)
  };
  
  const loadItems = async (currentGroceryItems) => {
    const result = await fetchAllData('expiration');
    if (result.success){
        const updatedItems = result.data.map((item) => {
          return {
            ...item,
            expiry: item.expirationDate,
            expiryDays: getExpiringSoonItems().find(expiryItem => expiryItem.id === item.id)?.remainingExpiryDays || 0// Changed function call

          };
        });

        const currentItemTexts = currentGroceryItems.map(item => item.text.toLowerCase());
        const sortedFilteredItems = updatedItems.filter(
          suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase())
        ).sort((a, b) => a.expiryDays - b.expiryDays).slice(0, 4);

        setExpirationSuggestions(sortedFilteredItems)
    } else {
      console.error('Error loading items:', result.error);
    }
  };

  const addItem = async (text?: string) => {
    const itemText = text || inputText;
    if (itemText && itemText.trim()) {
      const newItem = { id: Date.now().toString(), text: itemText, completed: false };
      sortItems([...items, newItem]);
      setInputText('');
      await insertData('groceryList', newItem);
    }
  };


  const toggleItem = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    const foundItem = items.find(item => item.id === id);
    await updateById('groceryList', id, {completed: !foundItem.completed});

    sortItems(updatedItems)
  };

  const sortItems = (allItems) => {
    // Sort so uncompleted items are at the top
    const sorted = allItems.sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
    setItems(sorted);
  }

  const deleteItem = async(id: string) => {
    setItems(items.filter(item => item.id !== id));
    const result = await deleteById('groceryList', id);
  };

  const renderItem = ({ item }: { item: { id: string; text: string; completed: boolean } }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => toggleItem(item.id)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🛒 Grocery List</Text>
          <Text style={styles.subtitle}>
            {items.filter(i => !i.completed).length} items to buy
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add grocery item..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => addItem()}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={() => addItem()}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your grocery list is empty</Text>
          }
          ListHeaderComponent={
            suggestions.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => addItem(suggestion.name)}
                    >
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionText}>{suggestion.name}</Text>
                        <Text style={[
                          suggestion.expiryDays < 0 
                            ? styles.suggestionExpiryExpired 
                            : styles.suggestionExpiry, 
                          { color: getExpiryColorByDays(suggestion.expiryDays) }
                        ]}>
                          ⏱️ {suggestion.expiryDays > 0 
                            ? `Expires in ${suggestion.expiryDays} days` 
                            : suggestion.expiryDays < 0 
                              ? `Expired for ${Math.abs(suggestion.expiryDays)} days` 
                              : 'Expires today'}
                        </Text>
                      </View>
                      <Text style={styles.suggestionPlus}>+</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 0,
    marginTop: 8,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 20,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 8,
    minWidth: '48%',
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionText: {
    color: '#2196F3',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionExpiry: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
   suggestionExpiryExpired: {
   fontSize: 11,
   fontWeight: 'bold',
   marginTop: 3,
  },
  suggestionPlus: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});