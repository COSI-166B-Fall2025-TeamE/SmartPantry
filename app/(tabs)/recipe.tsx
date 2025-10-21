import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native'
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View as RNView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/globalStyles';
import { useRouter } from 'expo-router';

interface Recipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate: string | null;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
  ingredients: Array<{
    ingredient: string;
    measure: string;
  }>;
  strSource: string | null;
  strImageSource: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;
}

const CATEGORIES = ['All', 'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Breakfast', 'Goat', 'Miscellaneous', 'Side', 'Starter', 'Vegan'];

export default function RecipeTabScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recipes from TheMealDB API
  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      if (selectedCategory === 'All') {
        // Fetch random meals for "All" category
        const randomMeals = await Promise.all(
          Array.from({ length: 12 }, () => 
            fetch('https://www.themealdb.com/api/json/v1/1/random.php')
              .then(res => res.json())
          )
        );
        
        const formattedRecipes = randomMeals
          .filter(result => result.meals && result.meals[0])
          .map(result => formatRecipe(result.meals[0]));
        
        // Remove duplicates based on idMeal
        const uniqueRecipes = Array.from(
          new Map(formattedRecipes.map(recipe => [recipe.idMeal, recipe])).values()
        );
        
        setRecipes(uniqueRecipes);
      } else {
        // Fetch specific category
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`);
        const data = await response.json();
        
        if (data.meals) {
          // Fetch full details for each meal (limit to 12 for performance)
          const detailedMeals = await Promise.all(
            data.meals.slice(0, 12).map((meal: any) => 
              fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                .then(res => res.json())
            )
          );
          
          const formattedRecipes = detailedMeals
            .filter(result => result.meals && result.meals[0])
            .map(result => formatRecipe(result.meals[0]));
          
          setRecipes(formattedRecipes);
        } else {
          setRecipes([]);
        }
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRecipe = (meal: any): Recipe => {
    // Extract ingredients and measures from the meal object
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      // Only add if ingredient exists and is not empty/null
      if (ingredient && ingredient.trim() && ingredient !== 'null') {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure && measure.trim() && measure !== 'null' ? measure.trim() : '',
        });
      }
    }

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strDrinkAlternate: meal.strDrinkAlternate,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      strInstructions: meal.strInstructions,
      strMealThumb: meal.strMealThumb,
      strTags: meal.strTags,
      strYoutube: meal.strYoutube,
      ingredients,
      strSource: meal.strSource,
      strImageSource: meal.strImageSource,
      strCreativeCommonsConfirmed: meal.strCreativeCommonsConfirmed,
      dateModified: meal.dateModified,
    };
  };

  // Search recipes by name AND ingredient simultaneously
  const handleSearch = async (query: string) => {
    if (query.length >= 3) {
      setLoading(true);
      try {
        // Search by recipe name
        const nameSearchPromise = fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
          .then(res => res.json());
        
        // Search by ingredient (replace spaces with underscores)
        const ingredientQuery = query.replace(/\s+/g, '_');
        const ingredientSearchPromise = fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientQuery}`)
          .then(res => res.json());
        
        // Wait for both searches to complete
        const [nameData, ingredientData] = await Promise.all([nameSearchPromise, ingredientSearchPromise]);
        
        let allRecipes: Recipe[] = [];
        
        // Add recipes from name search
        if (nameData.meals) {
          const nameRecipes = nameData.meals.map(formatRecipe);
          allRecipes = [...allRecipes, ...nameRecipes];
        }
        
        // Add recipes from ingredient search
        if (ingredientData.meals) {
          // Fetch full details for ingredient search results
          const detailedMeals = await Promise.all(
            ingredientData.meals.slice(0, 12).map((meal: any) => 
              fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                .then(res => res.json())
            )
          );
          
          const ingredientRecipes = detailedMeals
            .filter(result => result.meals && result.meals[0])
            .map(result => formatRecipe(result.meals[0]));
          
          allRecipes = [...allRecipes, ...ingredientRecipes];
        }
        
        // Remove duplicates based on idMeal
        const uniqueRecipes = Array.from(
          new Map(allRecipes.map(recipe => [recipe.idMeal, recipe])).values()
        );
        
        setRecipes(uniqueRecipes);
      } catch (error) {
        console.error('Error searching recipes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      // Reset to category view when search is cleared
      fetchRecipes();
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter recipes locally for shorter queries
  const displayedRecipes = searchQuery.length > 0 && searchQuery.length < 3
    ? recipes.filter(recipe => 
        recipe.strMeal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => 
          ing.ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : recipes;

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
            placeholder="Search by recipe name or ingredient (min 3 chars)"
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
              onPress={() => {
                setSelectedCategory(category);
                setSearchQuery(''); // Clear search when changing category
              }}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#371B34" />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.recipeGrid}>
              {displayedRecipes.length > 0 ? (
                displayedRecipes.map((recipe) => {
                  return (
                    <TouchableOpacity 
                      key={recipe.idMeal} 
                      style={styles.recipeCard}
                      onPress={() => router.push(`/recipe/${recipe.idMeal}`)}
                    >
                      <View style={styles.recipeImageContainer}>
                        <Image 
                          source={{ uri: recipe.strMealThumb }}
                          style={styles.recipeImage}
                          resizeMode="cover"
                        />
                      </View>
                      
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeName} numberOfLines={2}>
                          {recipe.strMeal}
                        </Text>
                        
                        <RNView style={styles.recipeDetails}>
                          <RNView style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🌍</Text>
                            <Text style={styles.detailText}>{recipe.strArea}</Text>
                          </RNView>
                          
                          <RNView style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{recipe.strCategory}</Text>
                          </RNView>
                        </RNView>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No recipes found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery.length > 0 && searchQuery.length < 3 
                      ? 'Type at least 3 characters to search'
                      : 'Try a different recipe name, ingredient, or category'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.6,
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
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
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
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  categoryBadgeText: {
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
