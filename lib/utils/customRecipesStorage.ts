import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_RECIPES_KEY = '@custom_recipes';

export interface CustomRecipe {
  idMeal: string; // Will be generated as "custom_${timestamp}"
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string; // URI to local image
  strTags: string | null;
  strYoutube: string;
  ingredients: Array<{
    ingredient: string;
    measure: string;
  }>;
  strSource: string | null;
  isCustom: boolean; // Flag to identify custom recipes
  dateCreated: string;
}

// Get all custom recipes
export const getCustomRecipes = async (): Promise<CustomRecipe[]> => {
  try {
    const recipesJson = await AsyncStorage.getItem(CUSTOM_RECIPES_KEY);
    if (recipesJson) {
      return JSON.parse(recipesJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting custom recipes:', error);
    return [];
  }
};

// Get a single custom recipe by ID
export const getCustomRecipe = async (id: string): Promise<CustomRecipe | null> => {
  try {
    const recipes = await getCustomRecipes();
    return recipes.find(recipe => recipe.idMeal === id) || null;
  } catch (error) {
    console.error('Error getting custom recipe:', error);
    return null;
  }
};

// Save a new custom recipe
export const saveCustomRecipe = async (recipe: Omit<CustomRecipe, 'idMeal' | 'isCustom' | 'dateCreated'>): Promise<CustomRecipe> => {
  try {
    const recipes = await getCustomRecipes();
    const newRecipe: CustomRecipe = {
      ...recipe,
      idMeal: `custom_${Date.now()}`,
      isCustom: true,
      dateCreated: new Date().toISOString(),
    };
    
    recipes.push(newRecipe);
    await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
    return newRecipe;
  } catch (error) {
    console.error('Error saving custom recipe:', error);
    throw error;
  }
};

// Update an existing custom recipe
export const updateCustomRecipe = async (id: string, updatedRecipe: Partial<CustomRecipe>): Promise<boolean> => {
  try {
    const recipes = await getCustomRecipes();
    const index = recipes.findIndex(recipe => recipe.idMeal === id);
    
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updatedRecipe };
      await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating custom recipe:', error);
    return false;
  }
};

// Delete a custom recipe
export const deleteCustomRecipe = async (id: string): Promise<boolean> => {
  try {
    const recipes = await getCustomRecipes();
    const filteredRecipes = recipes.filter(recipe => recipe.idMeal !== id);
    
    if (filteredRecipes.length < recipes.length) {
      await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(filteredRecipes));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting custom recipe:', error);
    return false;
  }
};
