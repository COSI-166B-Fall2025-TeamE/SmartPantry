import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import {
  FavoriteRecipe,
  isFavorite,
  toggleFavorite,
} from '@/lib/utils/favoritesStorage';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchAllData } from '@/components/DatabaseFunctions';
import { useFocusEffect } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  ActivityIndicator,
  Image,
  View as RNView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
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
  matchedIngredients?: string[];
}

interface PantryItem {
  id: string;
  name: string;
  expirationDate: string; // "2025-11-21" from your DB
  quantity?: string;
}

type FilterType = 'random' | 'expiring' | 'pantry';

const CATEGORIES = [
  'All',
  'Beef',
  'Chicken',
  'Dessert',
  'Lamb',
  'Pasta',
  'Pork',
  'Seafood',
  'Vegetarian',
  'Breakfast',
  'Goat',
  'Miscellaneous',
  'Side',
  'Starter',
  'Vegan',
];

export default function RecipeTabScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteStates, setFavoriteStates] = useState<{ [key: string]: boolean }>({});
  const [filterType, setFilterType] = useState<FilterType>('random');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const params = useLocalSearchParams();
  const initialSearch =
    typeof params.search === 'string' ? params.search : '';

  // Normalize a Date to local midnight (ignore time)
  const toDateOnly = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Load pantry items (same pattern as on home)
  const loadPantryItems = async () => {
    const result = await fetchAllData('expiration');
    if ((result as any).success) {
      const items = (result as any).data as PantryItem[];
      setPantryItems(items);

      // LOG: see what comes back
      console.log('Here are the items', items);

      const today = toDateOnly(new Date());
      const weekFromNow = toDateOnly(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      );

      console.log('Today (date-only):', today);
      console.log('Week from now (date-only):', weekFromNow);

      const expiring = items.filter((item) => {
        // handle possible "YYYY-MM-DDTHH:mm:ss" by splitting at "T"
        const raw = item.expirationDate?.split('T')[0] ?? item.expirationDate;
        const parsed = new Date(raw);

        if (isNaN(parsed.getTime())) {
          console.warn('Could not parse expirationDate for item', item);
          return false;
        }

        const dateOnly = toDateOnly(parsed);

        return dateOnly >= today && dateOnly <= weekFromNow;
      });

      setExpiringItems(expiring);
      console.log('Expiring soon items', expiring);
    } else {
      console.error('Error loading items:', (result as any).error);
      setPantryItems([]);
      setExpiringItems([]);
    }
  };

  // Refresh pantry when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadPantryItems();
      setRefreshTrigger((prev) => prev + 1);
    }, []),
  );

  // Fetch recipes when pantry/filters change
  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, filterType, refreshTrigger]);

  // Load favorites whenever recipes list changes
  useEffect(() => {
    loadFavoriteStates();
  }, [recipes]);

  // Apply initial search from home navigation
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
      if (filterType === 'random') {
        if (selectedCategory === 'All') {
          const randomMeals = await Promise.all(
            Array.from({ length: 12 }, () =>
              fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(
                (res) => res.json(),
              ),
            ),
          );

          const formattedRecipes = randomMeals
            .filter((result) => result.meals && result.meals[0])
            .map((result) => formatRecipe(result.meals[0]));

          const uniqueRecipes = Array.from(
            new Map(formattedRecipes.map((r) => [r.idMeal, r])).values(),
          );

          setRecipes(uniqueRecipes);
        } else {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`,
          );
          const data = await response.json();

          if (data.meals) {
            const detailedMeals = await Promise.all(
              data.meals.slice(0, 12).map((meal: any) =>
                fetch(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
                ).then((res) => res.json()),
              ),
            );

            const formattedRecipes = detailedMeals
              .filter((result) => result.meals && result.meals[0])
              .map((result) => formatRecipe(result.meals[0]));

            setRecipes(formattedRecipes);
          } else {
            setRecipes([]);
          }
        }
      } else if (filterType === 'expiring') {
        await fetchRecipesByPantryItems(expiringItems);
      } else if (filterType === 'pantry') {
        await fetchRecipesByPantryItems(pantryItems);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipesByPantryItems = async (items: PantryItem[]) => {
    if (!items || items.length === 0) {
      setRecipes([]);
      return;
    }

    try {
      const allRecipes: Recipe[] = [];

      for (const item of items) {
        console.log(`Fetching recipes for: ${item.name}`);

        const ingredientQuery = item.name.trim().replace(/\s+/g, '_');
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientQuery}`,
        );
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          console.log(`Found ${data.meals.length} recipes for ${item.name}`);

          const recipesToFetch = data.meals.slice(0, 2);

          const detailedMeals = await Promise.all(
            recipesToFetch.map((meal: any) =>
              fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
              )
                .then((res) => res.json())
                .catch((err) => {
                  console.error(`Error fetching recipe ${meal.idMeal}:`, err);
                  return null;
                }),
            ),
          );

          const formattedRecipes = detailedMeals
            .filter((result) => result && result.meals && result.meals[0])
            .map((result) => {
              const recipe = formatRecipe(result.meals[0]);
              recipe.matchedIngredients = [item.name];
              return recipe;
            });

          allRecipes.push(...formattedRecipes);
        } else {
          console.log(`No recipes found for ${item.name}`);
        }
      }

      const recipeMap = new Map<string, Recipe>();
      allRecipes.forEach((recipe) => {
        if (recipeMap.has(recipe.idMeal)) {
          const existing = recipeMap.get(recipe.idMeal)!;
          if (recipe.matchedIngredients) {
            existing.matchedIngredients = [
              ...(existing.matchedIngredients || []),
              ...recipe.matchedIngredients,
            ];
          }
        } else {
          recipeMap.set(recipe.idMeal, recipe);
        }
      });

      const finalRecipes = Array.from(recipeMap.values());
      setRecipes(finalRecipes);
    } catch (error) {
      console.error('Error fetching recipes by pantry items:', error);
      setRecipes([]);
    }
  };

  const formatRecipe = (meal: any): Recipe => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim() && ingredient !== 'null') {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure:
            measure && measure.trim() && measure !== 'null'
              ? measure.trim()
              : '',
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

  const handleSearch = async (query: string) => {
    if (query.length >= 3) {
      setLoading(true);
      try {
        const nameSearchPromise = fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`,
        ).then((res) => res.json());

        const ingredientQuery = query.replace(/\s+/g, '_');
        const ingredientSearchPromise = fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientQuery}`,
        ).then((res) => res.json());

        const [nameData, ingredientData] = await Promise.all([
          nameSearchPromise,
          ingredientSearchPromise,
        ]);

        let allRecipes: Recipe[] = [];

        if (nameData.meals) {
          const nameRecipes = nameData.meals.map(formatRecipe);
          allRecipes = [...allRecipes, ...nameRecipes];
        }

        if (ingredientData.meals) {
          const detailedMeals = await Promise.all(
            ingredientData.meals.slice(0, 12).map((meal: any) =>
              fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
              ).then((res) => res.json()),
            ),
          );

          const ingredientRecipes = detailedMeals
            .filter((result) => result.meals && result.meals[0])
            .map((result) => formatRecipe(result.meals[0]));

          allRecipes = [...allRecipes, ...ingredientRecipes];
        }

        const uniqueRecipes = Array.from(
          new Map(allRecipes.map((recipe) => [recipe.idMeal, recipe])).values(),
        );

        setRecipes(uniqueRecipes);
      } catch (error) {
        console.error('Error searching recipes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      fetchRecipes();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const displayedRecipes =
    searchQuery.length > 0 && searchQuery.length < 3
      ? recipes.filter(
          (recipe) =>
            recipe.strMeal
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            recipe.ingredients.some((ing) =>
              ing.ingredient.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        )
      : recipes;

  const handleFavoriteToggle = async (recipe: Recipe, event: any) => {
    event.stopPropagation();

    try {
      const favoriteRecipe: FavoriteRecipe = {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        strArea: recipe.strArea,
      };

      const newFavoriteState = await toggleFavorite(favoriteRecipe);

      setFavoriteStates((prev) => ({
        ...prev,
        [recipe.idMeal]: newFavoriteState,
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'random':
        return 'Random Suggestions';
      case 'expiring':
        return `Expiring Soon (${expiringItems.length} items)`;
      case 'pantry':
        return `My Pantry (${pantryItems.length} items)`;
      default:
        return 'Filter';
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={styles.title}>Recipe Recommendations</Text>
          <Text style={styles.subtitle}>Discover delicious meals</Text>

          <RNView style={styles.headerButtonContainer}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={() => router.push('/favorites' as Href)}
            >
              <Ionicons name="heart" size={20} color={colors.buttonText} />
              <Text
                style={[
                  styles.headerButtonText,
                  { color: colors.buttonText },
                ]}
              >
                My Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={() => router.push('/my-recipes' as Href)}
            >
              <Ionicons name="restaurant" size={20} color={colors.buttonText} />
              <Text
                style={[
                  styles.headerButtonText,
                  { color: colors.buttonText },
                ]}
              >
                My Recipes
              </Text>
            </TouchableOpacity>
          </RNView>
        </View>

        {/* Search Bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.background }]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.searchBar,
                color: colors.text,
              },
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

        {/* Filter Row */}
        <View
          style={[styles.filterRow, { backgroundColor: colors.background }]}
        >
          {/* Filter Dropdown */}
          <View style={styles.filterDropdownContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Ionicons name="filter" size={16} color={colors.buttonText} />
              <Text
                style={[
                  styles.filterButtonText,
                  { color: colors.buttonText },
                ]}
                numberOfLines={1}
              >
                {getFilterLabel()}
              </Text>
              <Ionicons
                name={showFilterDropdown ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.buttonText}
              />
            </TouchableOpacity>

            {showFilterDropdown && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: colors.card },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    filterType === 'random' && {
                      backgroundColor:
                        colorScheme === 'dark' ? '#4A4E6B' : '#E8E9F3',
                    },
                  ]}
                  onPress={() => {
                    setFilterType('random');
                    setShowFilterDropdown(false);
                  }}
                >
                  <Ionicons name="shuffle" size={18} color={colors.text} />
                  <Text
                    style={[
                      styles.dropdownText,
                      { color: colors.text },
                    ]}
                  >
                    Random Suggestions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    filterType === 'expiring' && {
                      backgroundColor:
                        colorScheme === 'dark' ? '#4A4E6B' : '#E8E9F3',
                    },
                  ]}
                  onPress={() => {
                    setFilterType('expiring');
                    setShowFilterDropdown(false);
                  }}
                >
                  <Ionicons name="time" size={18} color={colors.text} />
                  <Text
                    style={[
                      styles.dropdownText,
                      { color: colors.text },
                    ]}
                  >
                    Expiring Soon ({expiringItems.length} items)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    filterType === 'pantry' && {
                      backgroundColor:
                        colorScheme === 'dark' ? '#4A4E6B' : '#E8E9F3',
                    },
                  ]}
                  onPress={() => {
                    setFilterType('pantry');
                    setShowFilterDropdown(false);
                  }}
                >
                  <Ionicons name="list" size={18} color={colors.text} />
                  <Text
                    style={[
                      styles.dropdownText,
                      { color: colors.text },
                    ]}
                  >
                    My Pantry ({pantryItems.length} items)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Category Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? colors.buttonBackground
                        : colorScheme === 'dark'
                        ? '#4A4E6B'
                        : '#CDD0E3',
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === category
                          ? colors.buttonText
                          : colorScheme === 'dark'
                          ? '#fff'
                          : '#371B34',
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recipe List */}
        {loading ? (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <ActivityIndicator size="large" color={colors.buttonBackground} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.recipeGrid,
                { backgroundColor: colors.background },
              ]}
            >
              {displayedRecipes.length > 0 ? (
                displayedRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.idMeal}
                    style={styles.recipeCard}
                    onPress={() =>
                      router.push(`/recipe/${recipe.idMeal}` as Href)
                    }
                  >
                    <View style={styles.recipeImageContainer}>
                      <Image
                        source={{ uri: recipe.strMealThumb }}
                        style={styles.recipeImage}
                        resizeMode="cover"
                      />

                      <TouchableOpacity
                        style={styles.heartButton}
                        onPress={(e) => handleFavoriteToggle(recipe, e)}
                      >
                        <Ionicons
                          name={
                            favoriteStates[recipe.idMeal]
                              ? 'heart'
                              : 'heart-outline'
                          }
                          size={24}
                          color={
                            favoriteStates[recipe.idMeal] ? '#FF3B30' : '#fff'
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={[
                        styles.recipeInfo,
                        {
                          backgroundColor:
                            colorScheme === 'light'
                              ? 'rgba(128, 128, 128, 0.05)'
                              : colors.card,
                        },
                      ]}
                    >
                      <Text style={styles.recipeName} numberOfLines={2}>
                        {recipe.strMeal}
                      </Text>

                      <RNView style={styles.recipeDetails}>
                        <RNView style={styles.detailItem}>
                          <Text style={styles.detailIcon}>🌍</Text>
                          <Text
                            style={[
                              styles.detailText,
                              { color: colors.text },
                            ]}
                          >
                            {recipe.strArea}
                          </Text>
                        </RNView>

                        <RNView style={styles.badgesContainer}>
                          <RNView
                            style={[
                              styles.categoryBadge,
                              {
                                backgroundColor:
                                  colorScheme === 'dark'
                                    ? '#146ef5'
                                    : 'rgba(0, 122, 255, 0.1)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryBadgeText,
                                {
                                  color:
                                    colorScheme === 'dark'
                                      ? '#fff'
                                      : '#007AFF',
                                },
                              ]}
                            >
                              {recipe.strCategory}
                            </Text>
                          </RNView>

                          {recipe.matchedIngredients &&
                            recipe.matchedIngredients.length > 0 &&
                            recipe.matchedIngredients.map(
                              (ingredient, index) => (
                                <RNView
                                  key={`${recipe.idMeal}-${ingredient}-${index}`}
                                  style={styles.matchedIngredientBadge}
                                >
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={12}
                                    color="#fff"
                                  />
                                  <Text style={styles.matchedIngredientText}>
                                    {ingredient}
                                  </Text>
                                </RNView>
                              ),
                            )}
                        </RNView>
                      </RNView>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={styles.emptyStateText}>No recipes found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery.length > 0 && searchQuery.length < 3
                      ? 'Type at least 3 characters to search'
                      : filterType === 'expiring' &&
                        expiringItems.length === 0
                      ? 'No items expiring soon in your pantry'
                      : filterType === 'pantry' && pantryItems.length === 0
                      ? 'No items in your pantry'
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingLeft: 15,
    gap: 10,
  },
  filterDropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: 140,
    maxWidth: 200,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    minWidth: 240,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContent: {
    paddingRight: 15,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: 'transparent',
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
  matchedIngredientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchedIngredientText: {
    color: '#fff',
    fontSize: 11,
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
