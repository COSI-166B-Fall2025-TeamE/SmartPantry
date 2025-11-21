import Colors from '@/constants/templateColors';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateRemainingExpiryDays, getExpiryColorByDays } from '../data/expiryCalculator';
import { deleteById, fetchAllData, insertData, updateById } from './DatabaseFunctions';

type GroceryItem = {
  id: string;
  text: string;
  completed: boolean;
};

export default function GroceryList() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [items, setItems] = useState<Array<GroceryItem>>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setExpirationSuggestions] = useState([]);
  const [suggestionViewMode, setSuggestionViewMode] = useState<'days' | 'quantity'>('days');
  
  const loadItemsnew = async (currentGroceryItems) => {
    const result = await fetchAllData('expiration');
    if (result.success){
      //count the quantity
        const itemCounts = {};
        result.data.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        });

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

        const currentItemTexts = currentGroceryItems.map(item => item.text.toLowerCase());

        let sortedFilteredItems;
        if (suggestionViewMode === 'days') {
          //fliter by date
          sortedFilteredItems = updatedItems
            .filter(suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase()))
            .sort((a, b) => a.expiryDays - b.expiryDays)
            .slice(0, 4);
        } else {
          //fliter by quantity
          sortedFilteredItems = updatedItems
            .filter(suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase()))
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 4);
        }

        setExpirationSuggestions(sortedFilteredItems);
      } else {
        console.error('Error loading items:', result.error);
      }
        
  };

  useEffect(() => {
    loadItemsnew(items);
  }, [suggestionViewMode]);

  // Fetch all items on component mount
  useEffect(() => {
    loadItemsnew(items);
  }, [items]);

  useFocusEffect(
    React.useCallback(() => {      
      loadGroceryList()
      return () => {};
    }, []) 
  );

  const loadGroceryList = async () => {
    const groceryResult = await fetchAllData('groceryList');
    sortItems(groceryResult.data)
  };

  const [session, setSession] = useState<Session | null>(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  
  const addItem = async (text?: string) => {
    const itemText = text || inputText;
    if (itemText && itemText.trim()) {
      const newItem = { id: Date.now().toString(), text: itemText, completed: false };
      sortItems([...items, newItem]);
      setInputText('');
      await insertData('groceryList', newItem, session);
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
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => toggleItem(item.id)}
      >
        <View style={[
          styles.checkbox, 
          { borderColor: colorScheme === 'dark' ? colors.buttonBackground : '#371B34' },
          item.completed && { backgroundColor: colorScheme === 'dark' ? colors.buttonBackground : '#371B34' }
        ]}>
          {item.completed && <Text style={[styles.checkmark, { color: colorScheme === 'dark' ? colors.buttonText : '#fff' }]}>✓</Text>}
        </View>
        <Text style={[styles.itemText, { color: colors.text }, item.completed && styles.itemTextCompleted]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Grocery List</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {items.filter(i => !i.completed).length} items to buy
          </Text>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.searchBar, color: colors.text }]}
            placeholder="Add grocery item..."
            placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => addItem()}
            returnKeyType="done"
          />
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.buttonBackground }]} onPress={() => addItem()}>
            <Text style={[styles.addButtonText, { color: colors.buttonText }]}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.text }]}>Your grocery list is empty</Text>
          }
          ListHeaderComponent={
            suggestions.length > 0 ? (
              <View style={[styles.suggestionsWrapper, { backgroundColor: colors.background }]}>
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.background }]}>
                  <View style={styles.suggestionsHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggestions:</Text>
                    <TouchableOpacity 
                      style={[styles.toggleViewButton, { backgroundColor: colors.buttonBackground }]}
                      onPress={() => setSuggestionViewMode(suggestionViewMode === 'days' ? 'quantity' : 'days')}
                    >
                      <Text style={[styles.toggleViewButtonText, { color: colors.buttonText }]}>
                        {suggestionViewMode === 'days' ? 'click to show by remain quantity' : 'click to show by remain days'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.suggestionsGrid}>
                    {suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.suggestionChip,
                          { 
                            backgroundColor: colorScheme === 'dark' 
                              ? colors.buttonBackground 
                              : '#F5F5F5',
                            borderColor: colorScheme === 'dark' 
                              ? colors.buttonBackground 
                              : '#371B34'
                          }
                        ]}
                        onPress={() => addItem(suggestion.name)}
                      >
                        <View style={styles.suggestionContent}>
                          <Text style={[
                            styles.suggestionText,
                            { color: colorScheme === 'dark' ? colors.buttonText : colors.text }
                          ]}>
                            {suggestion.name}
                          </Text>
                          {suggestionViewMode === 'days' ? (
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
                          ) : (
                            <Text style={[
                              styles.suggestionQuantity,
                              { color: colors.text }
                            ]}>
                              📦 current {suggestion.quantity} in pantry
                            </Text>
                          )}
                        </View>
                        <Text style={[
                          styles.suggestionPlus,
                          { color: colorScheme === 'dark' ? colors.buttonText : colors.text }
                        ]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* Separator line */}
                <View style={[
                  styles.separator, 
                  { backgroundColor: colorScheme === 'dark' ? colors.border : '#E0E0E0' }
                ]} />
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
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 0,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
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
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 18,
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
    opacity: 0.7,
    marginBottom: 12,
  },
  suggestionsWrapper: {
    // Wrapper for suggestions and separator
  },
  suggestionsContainer: {
    paddingVertical: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    minWidth: '48%',
    maxWidth: '48%',
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionText: {
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },

  suggestionsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

toggleViewButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
},

toggleViewButtonText: {
  fontSize: 12,
  fontWeight: '600',
},

suggestionQuantity: {
  fontSize: 11,
  fontWeight: '600',
  marginTop: 3,
},
});
