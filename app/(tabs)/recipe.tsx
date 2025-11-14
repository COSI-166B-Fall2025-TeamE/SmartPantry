import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import { FavoriteRecipe, isFavorite, toggleFavorite } from '@/lib/utils/favoritesStorage';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View as RNView, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteStates, setFavoriteStates] = useState<{ [key: string]: boolean }>({});

  /* add for jumping from homepage expiring items with item name */
  const params = useLocalSearchParams();
  const initialSearch = typeof params.search === 'string' ? params.search : '';


  // Fetch recipes from TheMealDB API
  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);


  // Load favorite states for current recipes
  useEffect(() => {
    loadFavoriteStates();
  }, [recipes]);

  
  //Set the initial search value to the search state from homepage jumping
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const loadFavoriteStates = async () => {
    const states: { [key: string]: boolean } = {};
    for (const recipe of recipes) {
      states[recipe.idMeal] = await isFavorite(recipe.idMeal);
    }
    setFavoriteStates(states);
  };


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


  // Handle favorite toggle
  const handleFavoriteToggle = async (recipe: Recipe, event: any) => {
    event.stopPropagation(); // Prevent navigation when tapping heart
    
    try {
      const favoriteRecipe: FavoriteRecipe = {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        strArea: recipe.strArea,
      };
      
      const newFavoriteState = await toggleFavorite(favoriteRecipe);
      
      setFavoriteStates(prev => ({
        ...prev,
        [recipe.idMeal]: newFavoriteState
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor: colors.background }
      ]} 
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={styles.title}>Recipe Recommendations</Text>
          <Text style={styles.subtitle}>Discover delicious meals</Text>
          
          {/* Button Container */}
          <RNView style={styles.headerButtonContainer}>
            <TouchableOpacity 
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground }
              ]}
              onPress={() => router.push('/favorites' as Href)}
            >
              <Ionicons name="heart" size={20} color={colors.buttonText} />
              <Text style={[styles.headerButtonText, { color: colors.buttonText }]}>
                My Favorites
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground }
              ]}
              onPress={() => router.push('/my-recipes' as Href)}
            >
              <Ionicons name="restaurant" size={20} color={colors.buttonText} />
              <Text style={[styles.headerButtonText, { color: colors.buttonText }]}>
                My Recipes
              </Text>
            </TouchableOpacity>
          </RNView>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[
              styles.searchInput,
              { 
                backgroundColor: colors.searchBar,
                color: colors.text
              }
            ]}
            placeholder="Search by recipe name or ingredient (min 3 chars)"
            placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#999'}
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
          style={[styles.categoryContainer, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category 
                    ? colors.buttonBackground 
                    : (colorScheme === 'dark' ? '#4A4E6B' : '#CDD0E3')
                }
              ]}
              onPress={() => {
                setSelectedCategory(category);
                setSearchQuery(''); // Clear search when changing category
              }}
            >
              <Text style={[
                styles.categoryText,
                {
                  color: selectedCategory === category 
                    ? colors.buttonText 
                    : (colorScheme === 'dark' ? '#fff' : '#371B34')
                }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Recipe List */}
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.buttonBackground} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={[styles.recipeGrid, { backgroundColor: colors.background }]}>
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
                        
                        {/* Heart Button on Card */}
                        <TouchableOpacity
                          style={styles.heartButton}
                          onPress={(e) => handleFavoriteToggle(recipe, e)}
                        >
                          <Ionicons 
                            name={favoriteStates[recipe.idMeal] ? "heart" : "heart-outline"} 
                            size={24} 
                            color={favoriteStates[recipe.idMeal] ? "#FF3B30" : "#fff"} 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={[
                        styles.recipeInfo, 
                        { backgroundColor: colorScheme === 'light' ? 'rgba(128, 128, 128, 0.05)' : colors.card }
                      ]}>
                        <Text style={styles.recipeName} numberOfLines={2}>
                          {recipe.strMeal}
                        </Text>
                        
                        <RNView style={styles.recipeDetails}>
                          <RNView style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🌍</Text>
                            <Text style={[styles.detailText, { color: colors.text }]}>{recipe.strArea}</Text>
                          </RNView>
                          
                          <RNView style={[
                            styles.categoryBadge,
                            { backgroundColor: colorScheme === 'dark' ? '#146ef5' : 'rgba(0, 122, 255, 0.1)' }
                          ]}>
                            <Text style={[
                              styles.categoryBadgeText,
                              { color: colorScheme === 'dark' ? '#fff' : '#007AFF' }
                            ]}>{recipe.strCategory}</Text>
                          </RNView>
                        </RNView>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
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
    marginBottom: 10,
  },
  headerButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    position: 'relative',
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
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
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    padding: 15,
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
    backgroundColor: 'transparent',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'transparent',
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
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
