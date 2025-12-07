import { fetchAllData, insertData, updateById } from '@/components/DatabaseFunctions';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import { supabase } from '@/lib/supabase';
import {
  saveCustomRecipe,
  updateCustomRecipe
} from '@/lib/utils/customRecipesStorage';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView,
  Platform, View as RNView, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IngredientInput {
  ingredient: string;
  measure: string;
}

const CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Breakfast', 'Goat', 'Miscellaneous', 'Side', 'Starter', 'Vegan'];

export default function AddRecipeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [recipeName, setRecipeName] = useState('');
  const [category, setCategory] = useState('Miscellaneous');
  const [area, setArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ ingredient: '', measure: '' }]);
  const [tags, setTags] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Only run once when component mounts
    if (!initialLoadDone && params.id && typeof params.id === 'string') {
      loadRecipeForEditing(params.id);
      setInitialLoadDone(true);
    }
  }, []); // Empty dependency array - only runs once

  const loadRecipeForEditing = async (recipeId: string) => {
    try {
      const recipesResult = await fetchAllData('custom_recipes');
      const recipe = recipesResult.data.find(item => item.id === recipeId);
      
      if (recipe) {
        setIsEditing(true);
        setRecipeName(recipe.strMeal);
        setCategory(recipe.strCategory);
        setArea(recipe.strArea);
        setInstructions(recipe.strInstructions);
        setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ ingredient: '', measure: '' }]);
        setTags(recipe.strTags || '');
        setYoutubeUrl(recipe.strYoutube || '');
        setSourceUrl(recipe.strSource || '');
        setImageUri(recipe.strMealThumb);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient: '', measure: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const updateIngredient = (index: number, field: 'ingredient' | 'measure', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const validateForm = (): boolean => {
    if (!recipeName.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return false;
    }
    if (!area.trim()) {
      Alert.alert('Error', 'Please enter the cuisine/area');
      return false;
    }
    if (!instructions.trim()) {
      Alert.alert('Error', 'Please enter cooking instructions');
      return false;
    }
    // Image is optional

    const validIngredients = ingredients.filter(ing => ing.ingredient.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const validIngredients = ingredients
        .filter(ing => ing.ingredient.trim())
        .map(ing => ({
          ingredient: ing.ingredient.trim(),
          measure: ing.measure.trim(),
        }));

      // Use placeholder image if none selected
      const finalImageUri = imageUri || 'https://via.placeholder.com/400x300/CDD0E3/371B34?text=No+Image';

      const recipeData = {
        strMeal: recipeName.trim(),
        strCategory: category,
        strArea: area.trim(),
        strInstructions: instructions.trim(),
        strMealThumb: finalImageUri,
        strTags: tags.trim() || null,
        strYoutube: youtubeUrl.trim(),
        strSource: sourceUrl.trim() || null,
        ingredients: validIngredients,
      };

      if (isEditing && params.id) {
        await updateCustomRecipe(params.id as string, recipeData);
        await updateById('custom_recipes', params.id as string, recipeData);
        Alert.alert('Success', 'Recipe updated successfully!');
      } else {
        await saveCustomRecipe(recipeData);
        const newRecipe = {
          ...recipeData,
          ingredients: JSON.stringify(recipeData.ingredients),
          id: `custom_${Date.now()}`,
          isCustom: true,
          dateCreated: new Date().toISOString(),
        };

        await insertData('custom_recipes', newRecipe, session);
        Alert.alert('Success', 'Recipe saved successfully!');
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          animation: 'slide_from_bottom',
        }} 
      />
      <SafeAreaView 
        style={[
          styles.safeArea, 
          { backgroundColor: colors.background }
        ]} 
        edges={['top', 'left', 'right']}
      >
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={[styles.saveButtonText, { color: colors.buttonBackground, opacity: loading ? 0.5 : 1 }]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={[styles.form, { backgroundColor: colors.background }]}>
              {/* Image Picker (optional, no label text saying optional) */}
              <View style={styles.section}>
                <Text style={styles.label}>Recipe Image</Text>
                <TouchableOpacity 
                  style={[styles.imagePicker, { borderColor: colors.text }]}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  ) : (
                    <RNView style={styles.imagePickerPlaceholder}>
                      <Ionicons name="camera" size={40} color={colors.text} style={{ opacity: 0.5 }} />
                      <Text style={styles.imagePickerText}>Tap to select image</Text>
                    </RNView>
                  )}
                </TouchableOpacity>
              </View>

              {/* Recipe Name * */}
              <View style={styles.section}>
                <Text style={styles.label}>Recipe Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="e.g., Spaghetti Carbonara"
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={recipeName}
                  onChangeText={setRecipeName}
                />
              </View>

              {/* Category * */}
              <View style={styles.section}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                  nestedScrollEnabled={true}
                >
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: category === cat 
                            ? colors.buttonBackground 
                            : (colorScheme === 'dark' ? '#4A4E6B' : '#CDD0E3')
                        }
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.categoryText,
                        {
                          color: category === cat 
                            ? colors.buttonText 
                            : (colorScheme === 'dark' ? '#fff' : '#371B34')
                        }
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Cuisine/Area * */}
              <View style={styles.section}>
                <Text style={styles.label}>Cuisine/Area *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="e.g., Italian, Mexican, Chinese"
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={area}
                  onChangeText={setArea}
                />
              </View>

              {/* Ingredients * */}
              <View style={styles.section}>
                <RNView style={styles.labelRow}>
                  <Text style={styles.label}>Ingredients *</Text>
                  <TouchableOpacity onPress={addIngredient} activeOpacity={0.7}>
                    <Ionicons name="add-circle" size={24} color={colors.buttonBackground} />
                  </TouchableOpacity>
                </RNView>
                
                {ingredients.map((ingredient, index) => (
                  <RNView key={index} style={styles.ingredientRow}>
                    <TextInput
                      style={[
                        styles.ingredientInput,
                        { 
                          backgroundColor: colors.searchBar,
                          color: colors.text,
                          borderColor: colors.text,
                          flex: 2
                        }
                      ]}
                      placeholder="Ingredient"
                      placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                      value={ingredient.ingredient}
                      onChangeText={(text) => updateIngredient(index, 'ingredient', text)}
                    />
                    <TextInput
                      style={[
                        styles.ingredientInput,
                        { 
                          backgroundColor: colors.searchBar,
                          color: colors.text,
                          borderColor: colors.text,
                          flex: 1
                        }
                      ]}
                      placeholder="Amount"
                      placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                      value={ingredient.measure}
                      onChangeText={(text) => updateIngredient(index, 'measure', text)}
                    />
                    {ingredients.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => removeIngredient(index)}
                        style={styles.removeButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </RNView>
                ))}
              </View>

              {/* Instructions * */}
              <View style={styles.section}>
                <Text style={styles.label}>Cooking Instructions *</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="Enter step-by-step cooking instructions..."
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={instructions}
                  onChangeText={setInstructions}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              {/* Tags (no optional text) */}
              <View style={styles.section}>
                <Text style={styles.label}>Tags</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="e.g., Quick, Easy, Healthy (comma separated)"
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={tags}
                  onChangeText={setTags}
                />
              </View>

              {/* YouTube URL */}
              <View style={styles.section}>
                <Text style={styles.label}>YouTube Video URL</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={youtubeUrl}
                  onChangeText={setYoutubeUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Source URL */}
              <View style={styles.section}>
                <Text style={styles.label}>Source URL</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.searchBar,
                      color: colors.text,
                      borderColor: colors.text
                    }
                  ]}
                  placeholder="https://..."
                  placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
                  value={sourceUrl}
                  onChangeText={setSourceUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <RNView style={{ height: 40 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  cancelButton: {
    paddingVertical: 5,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 150,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  imagePicker: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  imagePickerText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.6,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ingredientInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  removeButton: {
    padding: 5,
  },
});
