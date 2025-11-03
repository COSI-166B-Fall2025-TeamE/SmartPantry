import { deleteById, fetchAllData, insertData } from '@/components/DatabaseFunctions';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated, FlatList, Modal, PanResponder, StyleSheet, Text, TextInput,
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
  colorScheme,
  onSwipeStart,
  onSwipeEnd,
  isGridView
}: { 
  item: PantryItem; 
  onDelete: () => void; 
  colorScheme: 'light' | 'dark';
  onSwipeStart: () => void;
  onSwipeEnd: () => void;
  isGridView: boolean;
}) => {
  const windowWidth = useWindowDimensions().width;
  const cardWidth = isGridView 
    ? (windowWidth - 48) / 2 
    : windowWidth - 32;
  const deleteButtonWidth = 100;
  
  const width = useRef(new Animated.Value(cardWidth)).current;
  const containerHeight = useRef(new Animated.Value(80)).current;
  const containerMargin = useRef(new Animated.Value(12)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
            const newWidth = Math.max(cardWidth + gestureState.dx, cardWidth - deleteButtonWidth);
            width.setValue(newWidth);
          } else if (isOpen && gestureState.dx > 0) {
            const newWidth = Math.min(cardWidth - deleteButtonWidth + gestureState.dx, cardWidth);
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
            toValue: isOpen ? cardWidth - deleteButtonWidth : cardWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
          return;
        }
        
        const hasSwipeVelocity = Math.abs(vx) > 0.3;
        
        if (dx < -30 || (hasSwipeVelocity && vx < 0)) {
          Animated.spring(width, {
            toValue: cardWidth - deleteButtonWidth,
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
            toValue: isOpen ? cardWidth - deleteButtonWidth : cardWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        onSwipeEnd();
        
        Animated.spring(width, {
          toValue: isOpen ? cardWidth - deleteButtonWidth : cardWidth,
          useNativeDriver: false,
          tension: 40,
          friction: 8,
        }).start();
      },
    })
  ).current;



  const handleDelete = () => {
    setIsDeleting(true);
    // Animate container height, margin, and opacity
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



  const handleCardPress = () => {
    if (isOpen) {
      Animated.spring(width, {
        toValue: cardWidth,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }).start();
      setIsOpen(false);
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
  const [newDate, setNewDate] = useState(new Date());
  const [isGridView, setIsGridView] = useState(false);


  // useEffect(() => {
  //   if (params.openModal === 'true') {
  //     setModalVisible(true);
  //     router.setParams({ openModal: undefined });
  //   }
  // }, [params.openModal]);

  useEffect(() => {
    loadPantryItems()
  }, [])

  const loadPantryItems = async () => {
    const pantryResult = await fetchAllData('expiration');
    setPantryItems(pantryResult.data)
  };

  const filteredItems = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = async () => {
    if (newItemName && newItemQuantity && newDate) {
      const newDateString = newDate.toISOString().substring(0, 10);
      
      console.log(newDate)
      const newItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
        expirationDate: newDateString,
      };

      // const newItem = { id: Date.now().toString(), text: itemText, completed: false };
      // sortItems([...items, newItem]);
      // setInputText('');
      await insertData('expiration', newItem);
      setPantryItems([...pantryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewDate(new Date());
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };



  const removeItem = async (id: string) => {
    setPantryItems(pantryItems.filter((item) => item.id !== id));
    const result = await deleteById('expiration', id);
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
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>My Pantry</Text>
      </View>


      {/* Search Bar with Toggle Button */}
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



      {/* Pantry Items List */}
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



      {/* Add Button */}
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



            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text
                }
              ]}
              placeholder="Quantity (e.g., 2 kg, 500 ml)"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />
            <Text>Expiration Date:</Text>
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
                onPress={() => setModalVisible(false)}
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
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    // backgroundColor set dynamically
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
  },
});



export default MyPantryScreen;
