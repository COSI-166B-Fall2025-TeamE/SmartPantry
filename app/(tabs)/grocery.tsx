import { getExpiringSoonItems } from '@/data/expiryCalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getExpiryColor, getSuggestions } from '@/data/suggestions';

type GroceryItem = {
  id: string;
  text: string;
  completed: boolean;
};

type Suggestion = {
  name: string;
  expiry: string;
  expiryDays: number;
};

type ExpiryItem = {
  name: string;
  expiry: string;
  expiryDays: number;
  remainingExpiryDays?: number;
  expirationDate?: string;
};

export default function GroceryList() {
  const [items, setItems] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; expiry: string; expiryDays: number }>>([]);

  const [expiringItems, setExpiringItems] = useState<ExpiryItem[]>([]);

  useEffect(() => {
    loadGroceryList();
  }, []);

  useEffect(() => {
    setSuggestions(getSuggestions(items));
    saveGroceryList(items);
    setExpiringItems(getExpiringSoonItems());
  }, [items]);

  const loadGroceryList = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('groceryList');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  };

  const saveGroceryList = async (itemsToSave: GroceryItem[]) => {
    try {
      await AsyncStorage.setItem('groceryList', JSON.stringify(itemsToSave));
    } catch (error) {
      console.error('Error saving grocery list:', error);
    }
  };

  const addItem = (text?: string) => {
    const itemText = text || inputText;
    if (itemText && itemText.trim()) {
      setItems([...items, { id: Date.now().toString(), text: itemText, completed: false }]);
      setInputText('');
    }
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    // Sort so uncompleted items are at the top
    const sorted = updatedItems.sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
    setItems(sorted);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List</Text>
          <Text style={styles.subtitle}>
            {items.filter(i => !i.completed).length} items to buy
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add grocery item..."
            placeholderTextColor="#999"
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
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your grocery list is empty</Text>
          }
          ListHeaderComponent={
            <>
            {expiringItems.length > 0 && (
                <View style={styles.expiringContainer}>
                  <Text style={styles.sectionTitle}>Current inventory:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.expiringScrollView}
                    contentContainerStyle={styles.expiringContentContainer}
                  >
                  {expiringItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.expiringChip}
                      onPress={() => addItem(item.name)}
                    >
                        <View style={styles.expiringContent}>
                          <Text style={styles.expiringText}>{item.name}</Text>
                        </View>
                        <Text style={styles.expiringPlus}>+</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

            {suggestions.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.sectionTitle}>Suggestions:</Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => addItem(suggestion.name)}
                    >
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionText}>{suggestion.name}</Text>
                        <Text style={[styles.suggestionExpiry, { color: getExpiryColor(suggestion.expiryDays) }]}>
                          ⏱️ Expires in {suggestion.expiry}
                        </Text>
                      </View>
                      <Text style={styles.suggestionPlus}>+</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderWidth: 0,
    color: '#000',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#371B34',
    borderRadius: 12,
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
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
    borderColor: '#371B34',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#371B34',
    borderColor: '#371B34',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 18,
    color: '#000',
    flex: 1,
    fontWeight: 'bold',
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    opacity: 0.7,
    marginBottom: 12,
  },
  expiringContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  expiringScrollView: {
    flexGrow: 0,
  },
  expiringContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiringChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f44336',
    marginRight: 8,
    minWidth: 150,
  },
  expiringContent: {
    flex: 1,
    marginRight: 8,
  },
  expiringText: {
    color: '#f44336',
    fontSize: 15,
    fontWeight: '600',
  },
  expiringPlus: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
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
  suggestionPlus: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
