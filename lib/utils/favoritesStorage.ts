import { deleteById, fetchAllData, insertData } from '@/components/DatabaseFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

const FAVORITES_KEY = '@favorites';

export interface FavoriteRecipe {
  id: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

// Get all favorites
export const getFavorites = async (): Promise<FavoriteRecipe[]> => {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
    if (favoritesJson !== null) {
      return JSON.parse(favoritesJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Check if a recipe is favorited
export const isFavorite = async (recipeId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.id === recipeId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Add to favorites
export const addToFavorites = async (recipe: FavoriteRecipe): Promise<void> => {
  try {
    const favorites = await getFavorites();
    
    // Check if already exists
    const alreadyExists = favorites.some(fav => fav.id === recipe.id);
    if (alreadyExists) {
      return;
    }
    
    const updatedFavorites = [...favorites, recipe];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove from favorites
export const removeFromFavorites = async (recipeId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (recipe: FavoriteRecipe, session: Session): Promise<boolean> => {
  try {
    const isCurrentlyFavorite = (await fetchAllData("favorite_recipes")).data.some(fav => fav.id === recipe.id);
    
    // const isCurrentlyFavorite = await isFavorite(recipe.id);
    
    if (isCurrentlyFavorite) {
      await deleteById("favorite_recipes", recipe.id)
      await removeFromFavorites(recipe.id);
      return false;
    } else {
      console.log(recipe)
      await addToFavorites(recipe);
      await insertData("favorite_recipes", recipe, session)
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};
