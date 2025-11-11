import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/templateColors';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, removeFromFavorites, FavoriteRecipe } from '@/lib/utils/favoritesStorage';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await removeFromFavorites(recipeId);
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.idMeal !== recipeId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
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
            <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Favorites</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Favorites List */}
          {favorites.length > 0 ? (
            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.buttonBackground}
                />
              }
            >
              <View style={[styles.favoritesGrid, { backgroundColor: colors.background }]}>
                {favorites.map((recipe) => (
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
                      
                      {/* Remove Heart Button */}
                      <TouchableOpacity
                        style={styles.heartButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(recipe.idMeal);
                        }}
                      >
                        <Ionicons 
                          name="heart" 
                          size={24} 
                          color="#FF3B30" 
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
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
              <Ionicons 
                name="heart-outline" 
                size={80} 
                color={colorScheme === 'dark' ? '#4A4E6B' : '#CDD0E3'} 
              />
              <Text style={styles.emptyStateText}>No Favorites Yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start adding recipes to your favorites by tapping the heart icon
              </Text>
              <TouchableOpacity 
                style={[styles.browseButton, { backgroundColor: colors.buttonBackground }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.browseButtonText, { color: colors.buttonText }]}>
                  Browse Recipes
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  favoritesGrid: {
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.7,
  },
  emptyStateSubtext: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
