import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PantryItem {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface RecipeStore {
  ingredients: string[];
  pantry: PantryItem[];
  addIngredient: (ingredient: string) => void;
  addIngredients: (ingredients: string[]) => void;
  removeIngredient: (ingredient: string) => void;
  setIngredients: (ingredients: string[]) => void;
  clearIngredients: () => void;
  addToPantry: (name: string) => void;
  addManyToPantry: (names: string[]) => void;
  updatePantryItem: (id: string, name: string) => void;
  removePantryItem: (id: string) => void;
  clearPantry: () => void;
}

const normalizeIngredientName = (name: string) => name.trim().replace(/\s+/g, ' ');

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      ingredients: [],
      pantry: [],
      addIngredient: (ingredient) =>
        set((state) => {
          const normalized = normalizeIngredientName(ingredient);
          if (!normalized) return state;
          if (state.ingredients.includes(normalized)) return state;
          return { ingredients: [...state.ingredients, normalized] };
        }),
      addIngredients: (ingredients) =>
        set((state) => {
          const incoming = ingredients
            .map(normalizeIngredientName)
            .filter(Boolean);
          if (incoming.length === 0) return state;
          const next = [...state.ingredients];
          for (const ing of incoming) {
            if (!next.includes(ing)) next.push(ing);
          }
          return { ingredients: next };
        }),
      removeIngredient: (ingredient) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i !== ingredient),
        })),
      setIngredients: (ingredients) =>
        set({
          ingredients: ingredients.map(normalizeIngredientName).filter(Boolean),
        }),
      clearIngredients: () => set({ ingredients: [] }),
      addToPantry: (name) => {
        const normalized = normalizeIngredientName(name);
        if (!normalized) return;
        const now = Date.now();
        set((state) => {
          const exists = state.pantry.some(
            (item) => item.name.toLowerCase() === normalized.toLowerCase(),
          );
          if (exists) return state;
          const next: PantryItem = {
            id: createId(),
            name: normalized,
            createdAt: now,
            updatedAt: now,
          };
          return { pantry: [next, ...state.pantry] };
        });
      },
      addManyToPantry: (names) => {
        const now = Date.now();
        const normalizedNames = names
          .map(normalizeIngredientName)
          .filter(Boolean);
        if (normalizedNames.length === 0) return;
        set((state) => {
          const existingLower = new Set(
            state.pantry.map((item) => item.name.toLowerCase()),
          );
          const nextItems: PantryItem[] = [];
          for (const n of normalizedNames) {
            const key = n.toLowerCase();
            if (existingLower.has(key)) continue;
            existingLower.add(key);
            nextItems.push({
              id: createId(),
              name: n,
              createdAt: now,
              updatedAt: now,
            });
          }
          if (nextItems.length === 0) return state;
          return { pantry: [...nextItems, ...state.pantry] };
        });
      },
      updatePantryItem: (id, name) => {
        const normalized = normalizeIngredientName(name);
        if (!normalized) return;
        const now = Date.now();
        set((state) => {
          const existsOther = state.pantry.some(
            (item) =>
              item.id !== id &&
              item.name.toLowerCase() === normalized.toLowerCase(),
          );
          if (existsOther) return state;
          return {
            pantry: state.pantry.map((item) =>
              item.id === id
                ? { ...item, name: normalized, updatedAt: now }
                : item,
            ),
          };
        });
      },
      removePantryItem: (id) =>
        set((state) => ({ pantry: state.pantry.filter((i) => i.id !== id) })),
      clearPantry: () => set({ pantry: [] }),
    }),
    {
      name: 'fast-ai-food-store',
      version: 1,
      partialize: (state) => ({
        ingredients: state.ingredients,
        pantry: state.pantry,
      }),
    },
  ),
);
