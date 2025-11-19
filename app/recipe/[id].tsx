import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, ActivityIndicator, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { isFavorite, toggleFavorite, FavoriteRecipe } from '@/lib/utils/favoritesStorage';
import { getCustomRecipe } from '@/lib/utils/customRecipesStorage';


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


export default function RecipeDetailScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYoutubeValid, setIsYoutubeValid] = useState(false);
  const [isSourceValid, setIsSourceValid] = useState(false);
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);


  useEffect(() => {
    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);


  // Validate URLs when recipe is loaded
  useEffect(() => {
    if (recipe) {
      validateLinks();
      checkFavoriteStatus();
    }
  }, [recipe]);


  const checkFavoriteStatus = async () => {
    if (recipe) {
      const favoriteStatus = await isFavorite(recipe.idMeal);
      setIsFavorited(favoriteStatus);
    }
  };


  const handleFavoriteToggle = async () => {
    if (!recipe) return;
    
    try {
      const favoriteRecipe: FavoriteRecipe = {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        strArea: recipe.strArea,
      };
      
      const newFavoriteState = await toggleFavorite(favoriteRecipe);
      setIsFavorited(newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


  const validateLinks = async () => {
    setCheckingLinks(true);
    
    // Check YouTube link
    if (recipe?.strYoutube) {
      const youtubeValid = await checkUrlValidity(recipe.strYoutube);
      setIsYoutubeValid(youtubeValid);
    }
    
    // Check source link
    if (recipe?.strSource) {
      const sourceValid = await checkUrlValidity(recipe.strSource);
      setIsSourceValid(sourceValid);
    }
    
    setCheckingLinks(false);
  };


  const checkUrlValidity = async (url: string): Promise<boolean> => {
    // First, validate URL format
    if (!isValidUrlFormat(url)) {
      return false;
    }


    // Check if URL can be opened (this works for deep links and external URLs)
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        return false;
      }
    } catch (error) {
      console.error('Error checking if URL can be opened:', url);
      return false;
    }


    // For http/https URLs, attempt a HEAD request to verify the link works
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout


        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        });


        clearTimeout(timeoutId);
        return response.ok; // Returns true if status is 200-299
      } catch (error) {
        // Gracefully handle network errors, CORS issues, timeouts, etc.
        // Don't log error to console - just return false
        // The URL might still work in a browser even if HEAD request fails
        // So we'll mark it as invalid but not crash the app
        return false;
      }
    }


    return true;
  };


  const isValidUrlFormat = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };


  const fetchRecipeDetails = async () => {
    setLoading(true);
    try {
      // Check if this is a custom recipe
      if (typeof id === 'string' && id.startsWith('custom_')) {
        const customRecipe = await getCustomRecipe(id);
        if (customRecipe) {
          setRecipe(customRecipe as any); // Cast to Recipe type
        }
      } else {
        // Fetch from API
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
          const formattedRecipe = formatRecipe(data.meals[0]);
          setRecipe(formattedRecipe);
        }
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setLoading(false);
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


  const openYouTube = () => {
    if (recipe?.strYoutube && isYoutubeValid) {
      Linking.openURL(recipe.strYoutube);
    }
  };


  const openSource = () => {
    if (recipe?.strSource && isSourceValid) {
      Linking.openURL(recipe.strSource);
    }
  };


  const getTags = (strTags: string | null): string[] => {
    if (!strTags) return [];
    return strTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };


  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView 
          style={[
            styles.safeArea, 
            { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
          ]} 
          edges={['top', 'left', 'right']}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#371B34" />
            <Text style={styles.loadingText}>Loading recipe...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }


  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView 
          style={[
            styles.safeArea, 
            { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
          ]} 
          edges={['top', 'left', 'right']}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Recipe not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }


  const tags = getTags(recipe.strTags);


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView 
        style={[
          styles.safeArea, 
          { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
        ]} 
        edges={['top', 'left', 'right']}
      >
        <View style={styles.container}>
          {/* Header with Back Button and Favorite Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Recipe</Text>
            <TouchableOpacity style={styles.favoriteIconButton} onPress={handleFavoriteToggle}>
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#FF3B30" : (colorScheme === 'dark' ? '#fff' : '#000')} 
              />
            </TouchableOpacity>
          </View>


          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Recipe Image */}
            <Image 
              source={{ uri: recipe.strMealThumb }}
              style={styles.heroImage}
              resizeMode="cover"
            />


            {/* Recipe Info */}
            <View style={styles.contentContainer}>
              <Text style={styles.recipeName}>{recipe.strMeal}</Text>


              {/* Category and Area */}
              <RNView style={styles.metaContainer}>
                <RNView style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🌍</Text>
                  <Text style={styles.metaText}>{recipe.strArea}</Text>
                </RNView>
                
                <RNView style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🍽️</Text>
                  <Text style={styles.metaText}>{recipe.strCategory}</Text>
                </RNView>
              </RNView>


              {/* Tags */}
              {tags.length > 0 && (
                <RNView style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <RNView key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </RNView>
                  ))}
                </RNView>
              )}


              {/* Action Buttons */}
              <RNView style={styles.actionButtons}>
                {recipe.strYoutube && (
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      colorScheme === 'dark' && styles.actionButtonDark,
                      (!isYoutubeValid || checkingLinks) && styles.actionButtonDisabled
                    ]} 
                    onPress={openYouTube}
                    disabled={!isYoutubeValid || checkingLinks}
                  >
                    {checkingLinks ? (
                      <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#371B34' : '#fff'} />
                    ) : (
                      <Text style={[
                        styles.actionButtonText,
                        colorScheme === 'dark' && styles.actionButtonTextDark,
                        (!isYoutubeValid || checkingLinks) && styles.actionButtonTextDisabled
                      ]}>
                        📹 Watch Video {!isYoutubeValid && '(Unavailable)'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                {recipe.strSource && (
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      styles.actionButtonSecondary,
                      colorScheme === 'dark' && styles.actionButtonSecondaryDark,
                      (!isSourceValid || checkingLinks) && styles.actionButtonSecondaryDisabled
                    ]} 
                    onPress={openSource}
                    disabled={!isSourceValid || checkingLinks}
                  >
                    {checkingLinks ? (
                      <ActivityIndicator size="small" color="#371B34" />
                    ) : (
                      <Text style={[
                        styles.actionButtonTextSecondary,
                        colorScheme === 'dark' && styles.actionButtonTextDark,
                        (!isSourceValid || checkingLinks) && styles.actionButtonTextDisabled
                      ]}>
                        🔗 Source {!isSourceValid && '(Unavailable)'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </RNView>


              {/* Ingredients Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsList}>
                  {recipe.ingredients.map((item, index) => (
                    <RNView key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientBullet}>•</Text>
                      <Text style={styles.ingredientText}>
                        {item.measure} {item.ingredient}
                      </Text>
                    </RNView>
                  ))}
                </View>
              </View>


              {/* Instructions Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.instructionsText}>{recipe.strInstructions}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
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
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    opacity: 0.6,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#371B34',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    padding: 20,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#371B34',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#CDD0E3',
  },
  actionButtonDisabled: {
    backgroundColor: '#CDD0E3',
    opacity: 0.5,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#371B34',
  },
  actionButtonSecondaryDark: {
    backgroundColor: '#CDD0E3',
    borderWidth: 0,
  },
  actionButtonSecondaryDisabled: {
    borderColor: '#CDD0E3',
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#371B34',
  },
  actionButtonTextSecondary: {
    color: '#371B34',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  ingredientsList: {
    gap: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ingredientBullet: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 2,
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.8,
  },
});
