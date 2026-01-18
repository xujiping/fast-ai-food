import { create } from 'zustand';

interface RecipeStore {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  setIngredients: (ingredients: string[]) => void;
  clearIngredients: () => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  ingredients: [],
  addIngredient: (ingredient) => set((state) => ({ 
    ingredients: [...state.ingredients, ingredient] 
  })),
  removeIngredient: (ingredient) => set((state) => ({ 
    ingredients: state.ingredients.filter(i => i !== ingredient) 
  })),
  setIngredients: (ingredients) => set({ ingredients }),
  clearIngredients: () => set({ ingredients: [] }),
}));
