import React, { useState } from 'react';
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


const getSuggestions = (currentItems: Array<{ id: string; text: string; completed: boolean }>) => {
  const allSuggestions = [
    { name: 'Milk', expiry: '7 days', expiryDays: 7 },
    { name: 'Eggs', expiry: '3-5 weeks', expiryDays: 28 },
    { name: 'Bread', expiry: '5-7 days', expiryDays: 6 },
    { name: 'Butter', expiry: '1-3 months', expiryDays: 60 },
    { name: 'Cheese', expiry: '3-4 weeks', expiryDays: 25 },
    { name: 'Chicken', expiry: '1-2 days', expiryDays: 1.5 },
    { name: 'Beef', expiry: '3-5 days', expiryDays: 4 },
    { name: 'Rice', expiry: '4-5 years', expiryDays: 1642 },
    { name: 'Pasta', expiry: '1-2 years', expiryDays: 547 },
    { name: 'Tomatoes', expiry: '1 week', expiryDays: 7 },
    { name: 'Lettuce', expiry: '7-10 days', expiryDays: 8.5 },
    { name: 'Apples', expiry: '4-6 weeks', expiryDays: 35 },
    { name: 'Bananas', expiry: '5-7 days', expiryDays: 6 },
    { name: 'Oranges', expiry: '3-4 weeks', expiryDays: 25 },
    { name: 'Coffee', expiry: '2-3 weeks', expiryDays: 17 },
    { name: 'Tea', expiry: '6-12 months', expiryDays: 270 },
    { name: 'Sugar', expiry: 'Indefinite', expiryDays: 3650 },
    { name: 'Salt', expiry: 'Indefinite', expiryDays: 3650 },
    { name: 'Pepper', expiry: '2-3 years', expiryDays: 912 },
    { name: 'Olive Oil', expiry: '18-24 months', expiryDays: 630 }
  ];
  
  const currentItemTexts = currentItems.map(item => item.text.toLowerCase());
  return allSuggestions.filter(
    suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase())
  ).slice(0, 6);
};

const getExpiryColor = (expiryDays: number) => {
  if (expiryDays <= 2) return '#D32F2F'; // Dark red for 0-2 days
  if (expiryDays <= 5) return '#F44336'; // Red for 3-5 days
  if (expiryDays <= 7) return '#FF5722'; // Deep orange for 6-7 days
  if (expiryDays <= 14) return '#FF9800'; // Orange for 1-2 weeks
  if (expiryDays <= 30) return '#FFC107'; // Amber for 2-4 weeks
  if (expiryDays <= 90) return '#8BC34A'; // Light green for 1-3 months
  return '#4CAF50'; // Green for 3+ months
};

export default function GroceryList() {
  const [items, setItems] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; expiry: string; expiryDays: number }>>([]);

  React.useEffect(() => {
    setSuggestions(getSuggestions(items));
  }, [items]);

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
                        <Text style={[styles.suggestionExpiry, { color: getExpiryColor(suggestion.expiryDays) }]}>
                          ⏱️ Expires in {suggestion.expiry}
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
  suggestionPlus: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});