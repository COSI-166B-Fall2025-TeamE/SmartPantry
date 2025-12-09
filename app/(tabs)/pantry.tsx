import { deleteById, fetchAllData, insertData, updateById } from '@/components/DatabaseFunctions';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated, FlatList, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, useColorScheme, useWindowDimensions, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/templateColors';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
}

const SwipeableItem = ({ 
  item, 
  onDelete,
  onAddToGrocery,
  onEdit,
  colorScheme,
  onSwipeStart,
  onSwipeEnd,
  isGridView
}: { 
  item: PantryItem; 
  onDelete: () => void;
  onAddToGrocery: () => void;
  onEdit: () => void;
  colorScheme: 'light' | 'dark';
  onSwipeStart: () => void;
  onSwipeEnd: () => void;
  isGridView: boolean;
}) => {
  const windowWidth = useWindowDimensions().width;
  const cardWidth = isGridView 
    ? (windowWidth - 48) / 2 
    : windowWidth - 32;
  const actionButtonWidth = 100;
  const totalActionsWidth = actionButtonWidth * 2; 
  
  const width = useRef(new Animated.Value(cardWidth)).current;
  const containerHeight = useRef(new Animated.Value(80)).current;
  const containerMargin = useRef(new Animated.Value(12)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const colors = Colors[colorScheme];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isGridView || isDeleting) return false;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return isHorizontal && Math.abs(gestureState.dx) > 2;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (isGridView || isDeleting) return false;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        return isHorizontal && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        onSwipeStart();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          if (gestureState.dx < 0) {
            const newWidth = Math.max(cardWidth + gestureState.dx, cardWidth - totalActionsWidth);
            width.setValue(newWidth);
          } else if (isOpen && gestureState.dx > 0) {
            const newWidth = Math.min(cardWidth - totalActionsWidth + gestureState.dx, cardWidth);
            width.setValue(newWidth);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        
        onSwipeEnd();
        
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        
        if (!isHorizontal) {
          Animated.spring(width, {
            toValue: isOpen ? cardWidth - totalActionsWidth : cardWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
          return;
        }
        
        const hasSwipeVelocity = Math.abs(vx) > 0.3;
        
        if (dx < -30 || (hasSwipeVelocity && vx < 0)) {
          Animated.spring(width, {
            toValue: cardWidth - totalActionsWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
          setIsOpen(true);
        } else if (dx > 30 || (hasSwipeVelocity && vx > 0)) {
          Animated.spring(width, {
            toValue: cardWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
          setIsOpen(false);
        } else {
          Animated.spring(width, {
            toValue: isOpen ? cardWidth - totalActionsWidth : cardWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        onSwipeEnd();
        
        Animated.spring(width, {
          toValue: isOpen ? cardWidth - totalActionsWidth : cardWidth,
          useNativeDriver: false,
          tension: 40,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const handleDelete = () => {
    setIsDeleting(true);
    Animated.parallel([
      Animated.timing(containerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(containerMargin, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const handleAddToGrocery = () => {
    onAddToGrocery();
    
    // close the swipe state
    setIsOpen(false);
    setSwipeDirection(null);
    Animated.spring(width, {
      toValue: cardWidth,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  };

  const handleCardPress = () => {
    if (isOpen) {
      Animated.spring(width, {
        toValue: cardWidth,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }).start();
      setIsOpen(false);
    } else {
      // Open edit modal on tap when card is closed
      onEdit();
    }
  };

  const handleLongPress = () => {
    handleDelete();
  };

  if (isGridView) {
    return (
      <View style={styles.gridItemWrapper}>
        <TouchableOpacity
          style={[
            styles.gridItemCard,
            { backgroundColor: colors.card }
          ]}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          <Text 
            style={[styles.gridItemName, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text 
            style={[styles.gridItemQuantity, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.quantity}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.outerContainer,
        { 
          height: containerHeight,
          marginBottom: containerMargin,
          opacity: containerOpacity,
        }
      ]}
    >
      <View style={styles.swipeableContainer}>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.groceryButton}
            onPress={handleAddToGrocery}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Grocery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.itemCard,
            { 
              backgroundColor: colors.card,
              width: width,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={[styles.itemInfo, { backgroundColor: 'transparent' }]}
            onPress={handleCardPress}
            activeOpacity={0.7}
          >
            <Text 
              style={[styles.itemName, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text 
              style={[styles.itemQuantity, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.quantity}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const MyPantryScreen = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);
  
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [isGridView, setIsGridView] = useState(false);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  
  const [newItemUnit, setNewItemUnit] = useState('');
  const [showNewItemUnitDropdown, setShowNewItemUnitDropdown] = useState(false);

  const units = ['kg', 'lbs', 'g', 'oz', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'pieces'];

  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (params.openModal === 'true') {
      setModalVisible(true);
      router.setParams({ openModal: undefined });
    }
    if (params.itemName !== undefined){
      const scannedItemName = Array.isArray(params.itemName) ? params.itemName[0] : params.itemName;
      setNewItemName(scannedItemName)
      router.setParams({ itemName: undefined });
    }
  }, [params.openModal]);

  useFocusEffect(
    React.useCallback(() => {      
      loadPantryItems();
      return () => {};
    }, []) 
  );

  const loadPantryItems = async () => {
    const pantryResult = await fetchAllData('expiration');
    setPantryItems(pantryResult.data)
  };

  const filteredItems = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    loadPantryItems()
  }, [session])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const addItem = async () => {
    if (newItemName && newItemQuantity && newDate) {
      const newDateString = newDate.toISOString().substring(0, 10);
      const fullQuantity = newItemUnit ? `${newItemQuantity} ${newItemUnit}` : newItemQuantity;
      
      const newItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: fullQuantity,
        expirationDate: newDateString,
      };

      await insertData('expiration', newItem, session);
      setPantryItems([...pantryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
      setShowNewItemUnitDropdown(false);
      setNewDate(new Date());
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const removeItem = async (id: string) => {
    setPantryItems(pantryItems.filter((item) => item.id !== id));
    await deleteById('expiration', id);
  };

  const addToGroceryList = async (item: PantryItem) => {
    try {
      // Create grocery item with same name
      const groceryItem = {
        id: Date.now().toString(),
        text: item.name,
        completed: false,
      };
      
      // Add to grocery list without removing from pantry
      await insertData('groceryList', groceryItem, session);
      
      Alert.alert(
        `"${item.name}" Has Been Added to Grocery List`,
        '',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to grocery list');
      console.error(error);
    }
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    // Parse existing quantity to separate number and unit
    const match = item.quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (match) {
      setEditQuantity(match[1]);
      setEditUnit(match[2] || '');
    } else {
      setEditQuantity(item.quantity);
      setEditUnit('');
    }
    setEditModalVisible(true);
  };

  const updateItemQuantity = async () => {
    if (!editingItem || !editQuantity.trim()) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      // Combine quantity and unit
      const fullQuantity = editUnit ? `${editQuantity} ${editUnit}` : editQuantity;
      
      // Update in database
      await updateById('expiration', editingItem.id, { quantity: fullQuantity });
      
      // Update local state
      setPantryItems(pantryItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, quantity: fullQuantity }
          : item
      ));
      
      setEditModalVisible(false);
      setEditingItem(null);
      setEditQuantity('');
      setEditUnit('');
      
      Alert.alert('Success', 'Quantity updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
      console.error(error);
    }
  };

  const [permission, requestPermission] = useCameraPermissions();

  const handleScanPress = async () => {
    let currentPermission = permission;
    
    if (!currentPermission?.granted) {
      currentPermission = await requestPermission();
    }
    
    if (currentPermission.granted) {
      router.push('/scan');
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
    }
  };

  const handleSwipeStart = () => {
    flatListRef.current?.setNativeProps({ scrollEnabled: false });
  };

  const handleSwipeEnd = () => {
    flatListRef.current?.setNativeProps({ scrollEnabled: true });
  };

  const renderItem = ({ item }: { item: PantryItem }) => (
    <SwipeableItem
      item={item}
      onDelete={() => removeItem(item.id)}
      onAddToGrocery={() => addToGroceryList(item)}
      onEdit={() => openEditModal(item)}
      colorScheme={colorScheme}
      onSwipeStart={handleSwipeStart}
      onSwipeEnd={handleSwipeEnd}
      isGridView={isGridView}
    />
  );

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || newDate;
    setNewDate(currentDate);
  };

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: colors.background }
      ]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>My Pantry</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <TextInput
          style={[
            styles.searchBar,
            { 
              backgroundColor: colors.searchBar,
              color: colors.text
            }
          ]}
          placeholder="Search ingredients..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
        />
        <TouchableOpacity
          style={[
            styles.viewToggleButton, 
            { 
              backgroundColor: colors.buttonBackground
            }
          ]}
          onPress={() => setIsGridView(!isGridView)}
        >
          <Ionicons 
            name={isGridView ? 'list' : 'grid'} 
            size={24} 
            color={colors.buttonText}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        key={isGridView ? 'grid' : 'list'}
        ref={flatListRef}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={isGridView ? 2 : 1}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={isGridView ? styles.gridRow : undefined}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>No items found</Text>
        }
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: colors.buttonBackground }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.addButtonText,
          { color: colors.buttonText }
        ]}>+ Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.scanButton,
          { backgroundColor: colors.buttonBackground }
        ]}
        onPress={() => handleScanPress()}
      >
        <Text style={[
          styles.addButtonText,
          { color: colors.buttonText }
        ]}>+ Scan Item</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colors.background }
          ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Item</Text>

            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text
                }
              ]}
              placeholder="Item name"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Amount:</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text
                }
              ]}
              placeholder="e.g., 20"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Unit:</Text>
            <TouchableOpacity
              style={[
                styles.unitSelector,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowNewItemUnitDropdown(!showNewItemUnitDropdown)}
            >
              <Text style={[styles.unitSelectorText, { color: colors.text }]}>
                {newItemUnit || 'Select unit'}
              </Text>
              <Ionicons 
                name={showNewItemUnitDropdown ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.text}
              />
            </TouchableOpacity>

            {showNewItemUnitDropdown && (
              <ScrollView 
                style={[styles.unitDropdown, { backgroundColor: colors.card }]}
                scrollEnabled={true}
                nestedScrollEnabled={true}
              >
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitOption,
                      newItemUnit === unit && { backgroundColor: colors.buttonBackground }
                    ]}
                    onPress={() => {
                      setNewItemUnit(unit);
                      setShowNewItemUnitDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        { color: newItemUnit === unit ? colors.buttonText : colors.text }
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Expiration Date:</Text>
            <DateTimePicker
              testID="dateTimePicker"
              value={newDate}
              is24Hour={true}
              display="default"
              onChange={onChange}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.cancelButton,
                  { backgroundColor: colors.secondaryButton }
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setNewItemName('');
                  setNewItemQuantity('');
                  setNewItemUnit('');
                  setShowNewItemUnitDropdown(false);
                  setNewDate(new Date());
                }}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: colors.secondaryButtonText }
                ]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  { backgroundColor: colors.buttonBackground }
                ]}
                onPress={addItem}
              >
                <Text style={[
                  styles.saveButtonText,
                  { color: colors.buttonText }
                ]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colors.background }
          ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit "{editingItem?.name}" Quantity
            </Text>

            {/* Amount Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Amount:</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text
                }
              ]}
              placeholder="e.g., 20"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="decimal-pad"
            />

            {/* Unit Selector */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Unit:</Text>
            <TouchableOpacity
              style={[
                styles.unitSelector,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowUnitDropdown(!showUnitDropdown)}
            >
              <Text style={[styles.unitSelectorText, { color: colors.text }]}>
                {editUnit || 'Select unit'}
              </Text>
              <Ionicons 
                name={showUnitDropdown ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.text}
              />
            </TouchableOpacity>

            {/* Unit Dropdown */}
            {showUnitDropdown && (
              <ScrollView 
                style={[styles.unitDropdown, { backgroundColor: colors.card }]}
                scrollEnabled={true}
                nestedScrollEnabled={true}
              >
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitOption,
                      editUnit === unit && { backgroundColor: colors.buttonBackground }
                    ]}
                    onPress={() => {
                      setEditUnit(unit);
                      setShowUnitDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        { color: editUnit === unit ? colors.buttonText : colors.text }
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.cancelButton,
                  { backgroundColor: colors.secondaryButton }
                ]}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingItem(null);
                  setEditQuantity('');
                  setEditUnit('');
                  setShowUnitDropdown(false);
                }}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: colors.secondaryButtonText }
                ]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  { backgroundColor: colors.buttonBackground }
                ]}
                onPress={updateItemQuantity}
              >
                <Text style={[
                  styles.saveButtonText,
                  { color: colors.buttonText }
                ]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    height: 50,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  viewToggleButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  outerContainer: {
    overflow: 'hidden',
  },
  swipeableContainer: {
    position: 'relative',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groceryButton: {
    backgroundColor: '#92bf92ff',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 12,
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    opacity: 0.7,
  },
  gridItemWrapper: {
    flex: 1,
    marginBottom: 12,
    maxWidth: '48%',
  },
  gridItemCard: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  gridItemQuantity: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {},
  saveButton: {},
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  unitSelector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitSelectorText: {
    fontSize: 16,
  },
  unitDropdown: {
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  unitOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unitOptionText: {
    fontSize: 16,
  },
});

export default MyPantryScreen;