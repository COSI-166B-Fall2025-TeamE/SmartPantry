import { deleteById, fetchAllData } from '@/components/DatabaseFunctions';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import { supabase } from '@/lib/supabase';
import { CustomRecipe, getCustomRecipes } from '@/lib/utils/customRecipesStorage';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { Href, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, View as RNView, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyRecipesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recipes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // loadRecipes();
      loadRecipesDatabase();
    }, [])
  );
    
  
  const loadRecipesDatabase = async () => {
    const recipesResult = await fetchAllData('custom_recipes');
    setRecipes(recipesResult.data)
    setLoading(false);
  };
    
  const [session, setSession] = useState<Session | null>(null)
  
  useEffect(() => {
    loadRecipesDatabase();
  }, [session])
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const customRecipes = await getCustomRecipes();
      setRecipes(customRecipes);
    } catch (error) {
      console.error('Error loading custom recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // const success = await deleteCustomRecipe(recipeId);
            const success = await deleteById("custom_recipes", recipeId);
            if (success.success) {
              loadRecipesDatabase();
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView 
        style={[
          styles.safeArea, 
          { backgroundColor: colors.background }
        ]} 
        edges={['top', 'left', 'right']}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>My Recipes</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Recipe List */}
          {loading ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.buttonBackground} />
              <Text style={styles.loadingText}>Loading your recipes...</Text>
            </View>
          ) : recipes.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
              <Ionicons 
                name="restaurant-outline" 
                size={80} 
                color={colors.text} 
                style={{ opacity: 0.3 }} 
              />
              <Text style={styles.emptyStateText}>No custom recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first recipe
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.recipeGrid, { backgroundColor: colors.background }]}>
                {recipes.map((recipe) => (
                  <TouchableOpacity 
                    key={recipe.id} 
                    style={styles.recipeCard}
                    onPress={() => router.push(`/recipe/${recipe.id}` as Href)}
                  >
                    <View style={styles.recipeImageContainer}>
                      <Image 
                        source={{ uri: recipe.strMealThumb }}
                        style={styles.recipeImage}
                        resizeMode="cover"
                      />
                      
                      {/* Edit and Delete Buttons */}
                      <RNView style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: 'rgba(0, 122, 255, 0.9)' }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/add-recipe?id=${recipe.id}` as Href);
                          }}
                        >
                          <Ionicons name="pencil" size={18} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: 'rgba(255, 59, 48, 0.9)' }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(recipe.id, recipe.strMeal);
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#fff" />
                        </TouchableOpacity>
                      </RNView>
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
                ))}
              </View>
            </ScrollView>
          )}

          {/* Floating Add Button */}
          <TouchableOpacity
            style={[
              styles.floatingAddButton,
              { backgroundColor: colors.buttonBackground }
            ]}
            onPress={() => router.push('/add-recipe' as Href)}
          >
            <Ionicons name="add" size={28} color={colors.buttonText} />
          </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.4,
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  recipeGrid: {
    padding: 15,
    paddingBottom: 90,
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
  actionButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
