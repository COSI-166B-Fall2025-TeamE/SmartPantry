import { useState } from 'react';
import { useColorScheme } from 'react-native'
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View as RNView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/globalStyles';

const SAMPLE_RECIPES = [
  {
    id: 1,
    name: 'Grilled Chicken Salad',
    prepTime: '25 mins',
    difficulty: 'Easy',
    calories: 320,
    category: 'Healthy',
    image: '🥗',
    ingredients: ['Chicken', 'Lettuce', 'Tomatoes', 'Olive Oil']
  },
  {
    id: 2,
    name: 'Spaghetti Carbonara',
    prepTime: '30 mins',
    difficulty: 'Medium',
    calories: 580,
    category: 'Pasta',
    image: '🍝',
    ingredients: ['Pasta', 'Eggs', 'Bacon', 'Parmesan']
  },
  {
    id: 3,
    name: 'Vegetable Stir Fry',
    prepTime: '20 mins',
    difficulty: 'Easy',
    calories: 240,
    category: 'Vegetarian',
    image: '🥘',
    ingredients: ['Broccoli', 'Carrots', 'Soy Sauce', 'Garlic']
  },
  {
    id: 4,
    name: 'Beef Tacos',
    prepTime: '35 mins',
    difficulty: 'Easy',
    calories: 450,
    category: 'Mexican',
    image: '🌮',
    ingredients: ['Ground Beef', 'Tortillas', 'Cheese', 'Lettuce']
  },
  {
    id: 5,
    name: 'Salmon Teriyaki',
    prepTime: '40 mins',
    difficulty: 'Medium',
    calories: 380,
    category: 'Seafood',
    image: '🐟',
    ingredients: ['Salmon', 'Teriyaki Sauce', 'Rice', 'Vegetables']
  },
  {
    id: 6,
    name: 'Mushroom Risotto',
    prepTime: '45 mins',
    difficulty: 'Hard',
    calories: 420,
    category: 'Vegetarian',
    image: '🍄',
    ingredients: ['Arborio Rice', 'Mushrooms', 'Parmesan', 'White Wine']
  }
];

const CATEGORIES = ['All', 'Healthy', 'Pasta', 'Vegetarian', 'Mexican', 'Seafood'];

export default function RecipeTabScreen() {
  const colorScheme = useColorScheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recipes by category and search query
  const filteredRecipes = SAMPLE_RECIPES.filter(recipe => {
    // Category filter
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    
    // Search filter (search in recipe name and ingredients)
    const matchesSearch = searchQuery === '' || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
      ]} 
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipe Recommendations</Text>
          <Text style={styles.subtitle}>Discover delicious meals</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by recipe or ingredient"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipe List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.recipeGrid}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeImageContainer}>
                    <Text style={styles.recipeEmoji}>{recipe.image}</Text>
                  </View>
                  
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    
                    <RNView style={styles.recipeDetails}>
                      <RNView style={styles.detailItem}>
                        <Text style={styles.detailIcon}>⏱️</Text>
                        <Text style={styles.detailText}>{recipe.prepTime}</Text>
                      </RNView>
                      
                      <RNView style={styles.detailItem}>
                        <Text style={styles.detailIcon}>🔥</Text>
                        <Text style={styles.detailText}>{recipe.calories} cal</Text>
                      </RNView>
                      
                      <RNView style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                      </RNView>
                    </RNView>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recipes found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search term or category
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    alignItems: 'center',
    paddingTop: 20,
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
  searchContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    position: 'relative',
  },
  searchInput: {
    height: 50,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  categoryContainer: {
    maxHeight: 40,
    marginBottom: 15,
  },
  categoryContent: {
    paddingHorizontal: 15,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#CDD0E3',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#371B34',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#371B34',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  recipeGrid: {
    padding: 15,
    gap: 15,
  },
  recipeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  recipeImageContainer: {
    height: 150,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeEmoji: {
    fontSize: 64,
  },
  recipeInfo: {
    padding: 15,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    opacity: 0.7,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.4,
  },
});