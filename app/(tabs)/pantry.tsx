import { useState, useRef } from 'react';
import { useColorScheme } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/templateColors';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
}

const SwipeableItem = ({ item, onDelete, colorScheme }: { item: PantryItem; onDelete: () => void; colorScheme: 'light' | 'dark' }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const colors = Colors[colorScheme];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          Animated.spring(translateX, {
            toValue: -100,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        {
          text: 'Remove',
          onPress: () => {
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete();
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.itemCard,
          { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#E8EAF6' },
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.itemInfo, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemQuantity, { color: colors.text }]}>{item.quantity}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const MyPantryScreen = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    { id: '1', name: 'Flour', quantity: '2 kg' },
    { id: '2', name: 'Sugar', quantity: '1 kg' },
    { id: '3', name: 'Olive Oil', quantity: '500 ml' },
    { id: '4', name: 'Tomatoes', quantity: '6 pcs' },
    { id: '5', name: 'Milk', quantity: '1 L' },
    { id: '6', name: 'Chicken Breast', quantity: '500 g' },
    { id: '7', name: 'Rice', quantity: '3 kg' },
    { id: '8', name: 'Eggs', quantity: '12 pcs' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const filteredItems = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (newItemName && newItemQuantity) {
      const newItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
      };
      setPantryItems([...pantryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const removeItem = (id: string) => {
    setPantryItems(pantryItems.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }: { item: PantryItem }) => (
    <SwipeableItem
      item={item}
      onDelete={() => removeItem(item.id)}
      colorScheme={colorScheme}
    />
  );

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: colors.background }
      ]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>My Pantry</Text>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchBar,
          { 
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : 'rgba(128, 128, 128, 0.1)',
            color: colors.text
          }
        ]}
        placeholder="Search ingredients..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
      />

      {/* Pantry Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>No items found</Text>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff' }
          ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Item</Text>

            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#e0e0e0',
                  backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff',
                  color: colors.text
                }
              ]}
              placeholder="Item name"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#e0e0e0',
                  backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff',
                  color: colors.text
                }
              ]}
              placeholder="Quantity (e.g., 2 kg, 500 ml)"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.cancelButton,
                  { backgroundColor: colorScheme === 'dark' ? '#3A3A3C' : '#f0f0f0' }
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: colorScheme === 'dark' ? '#fff' : '#666' }
                ]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addItem}
              >
                <Text style={styles.saveButtonText}>Add</Text>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
    marginBottom: 5,
  },
  searchBar: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  swipeableContainer: {
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#371B34',
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
    color: '#fff',
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
  cancelButton: {
    // backgroundColor set dynamically
  },
  saveButton: {
    backgroundColor: '#371B34',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MyPantryScreen;
