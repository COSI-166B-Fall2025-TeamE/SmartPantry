import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
}

const MyPantryScreen = () => {
  const colorScheme = useColorScheme();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    { id: '1', name: 'Flour', quantity: '2 kg', category: 'Grains' },
    { id: '2', name: 'Sugar', quantity: '1 kg', category: 'Grains' },
    { id: '3', name: 'Olive Oil', quantity: '500 ml', category: 'Oils' },
    { id: '4', name: 'Tomatoes', quantity: '6 pcs', category: 'Produce' },
    { id: '5', name: 'Milk', quantity: '1 L', category: 'Dairy' },
    { id: '6', name: 'Chicken Breast', quantity: '500 g', category: 'Proteins' },
    { id: '7', name: 'Rice', quantity: '3 kg', category: 'Grains' },
    { id: '8', name: 'Eggs', quantity: '12 pcs', category: 'Dairy' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Filter items based on search term
  const filteredItems = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new item
  const addItem = () => {
    if (newItemName && newItemQuantity) {
      const newItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
        category: newItemCategory || 'Other',
      };
      setPantryItems([...pantryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCategory('');
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  // Remove item
  const removeItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            setPantryItems(pantryItems.filter((item) => item.id !== id));
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Render each pantry item
  const renderItem = ({ item }: { item: PantryItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
      ]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <Text style={styles.header}>My Pantry</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholderTextColor="#999"
      />

      {/* Pantry Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items found</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor="#999"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g., 2 kg, 500 ml)"
              placeholderTextColor="#999"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />

            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Grains, Dairy)"
              placeholderTextColor="#999"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  itemCard: {
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
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
    borderColor: '#e0e0e0',
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
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#371B34',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MyPantryScreen;