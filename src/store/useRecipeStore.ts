import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRESET_INGREDIENTS } from '@/lib/ingredient-data';

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface Recipe {
  id?: string;
  name: string;
  description: string;
  cooking_time: number;
  difficulty: string;
  image_url?: string;
  recipe_source?: 'local' | 'ai';
  match_score?: number;
}

interface RecipeStore {
  userId: string | null;
  ingredients: string[];
  pantry: PantryItem[];
  recipes: Recipe[];
  lastFetchMode: string | null;
  
  init: () => Promise<void>;
  
  addIngredient: (ingredient: string) => void;
  addIngredients: (ingredients: string[]) => void;
  removeIngredient: (ingredient: string) => void;
  setIngredients: (ingredients: string[]) => void;
  clearIngredients: () => void;
  
  setRecipes: (recipes: Recipe[], mode: string | null) => void;

  addToPantry: (name: string) => Promise<void>;
  addManyToPantry: (names: string[]) => Promise<void>;
  updatePantryItem: (id: string, name: string) => Promise<void>;
  removePantryItem: (id: string) => Promise<void>;
  clearPantry: () => Promise<void>;
}

const normalizeIngredientName = (name: string) => name.trim().replace(/\s+/g, ' ');

// Helper to find category and icon from presets
const getIngredientMeta = (name: string) => {
  for (const cat of PRESET_INGREDIENTS) {
    const found = cat.items.find(item => item.name === name);
    if (found) {
      return { category: cat.name, icon: found.icon };
    }
  }
  return { category: '其他', icon: '🥘' };
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      userId: null,
      ingredients: [],
      pantry: [],
      recipes: [],
      lastFetchMode: null,
      
      init: async () => {
        let { userId } = get();
        if (!userId) {
          try {
            const res = await fetch('/api/auth/guest', { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              userId = data.user.id;
              set({ userId });
            }
          } catch (e) {
            console.error('Failed to init guest user', e);
            return;
          }
        }
        
        if (userId) {
          try {
            const res = await fetch('/api/ingredients', {
              headers: { 'x-user-id': userId }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.length > 0) {
                set({
                  pantry: data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category || '其他',
                    icon: item.icon || '🥘',
                    createdAt: new Date(item.created_at).getTime(),
                    updatedAt: new Date(item.updated_at).getTime(),
                  }))
                });
              } else {
                // DB is empty. Check if we have local data to migrate.
                const { pantry } = get();
                if (pantry.length > 0) {
                   // Migration logic needs update for new fields
                   const itemsToMigrate = pantry.map(p => ({
                     name: p.name,
                     ...getIngredientMeta(p.name)
                   }));
                   
                   try {
                     const postRes = await fetch('/api/ingredients', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                       body: JSON.stringify({ ingredients: itemsToMigrate })
                     });
                     if (postRes.ok) {
                       const newData = await postRes.json();
                       set({
                          pantry: newData.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            category: item.category || '其他',
                            icon: item.icon || '🥘',
                            createdAt: new Date(item.created_at).getTime(),
                            updatedAt: new Date(item.updated_at).getTime(),
                          }))
                        });
                     }
                   } catch (e) {
                     console.error('Migration failed', e);
                   }
                }
              }
            }
          } catch (e) {
             console.error('Failed to fetch ingredients', e);
          }
        }
      },

      addIngredient: (ingredient) =>
        set((state) => {
          const normalized = normalizeIngredientName(ingredient);
          if (!normalized) return state;
          if (state.ingredients.includes(normalized)) return state;
          return { 
            ingredients: [...state.ingredients, normalized],
            recipes: [],
            lastFetchMode: null
          };
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
          return { 
            ingredients: next,
            recipes: [],
            lastFetchMode: null
          };
        }),

      removeIngredient: (ingredient) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i !== ingredient),
          recipes: [],
          lastFetchMode: null
        })),

      setIngredients: (ingredients) =>
        set({
          ingredients: ingredients.map(normalizeIngredientName).filter(Boolean),
          recipes: [],
          lastFetchMode: null
        }),

      clearIngredients: () => set({ 
        ingredients: [],
        recipes: [],
        lastFetchMode: null
      }),

      setRecipes: (recipes, mode) => set({ recipes, lastFetchMode: mode }),

      addToPantry: async (name) => {
        const normalized = normalizeIngredientName(name);
        if (!normalized) return;
        
        const { userId, pantry } = get();
        // Optimistic check for duplicates
        if (pantry.some(i => i.name.toLowerCase() === normalized.toLowerCase())) return;

        const meta = getIngredientMeta(normalized);
        const optimisticItem: PantryItem = {
           id: 'temp-' + Date.now(),
           name: normalized,
           category: meta.category,
           icon: meta.icon,
           createdAt: Date.now(),
           updatedAt: Date.now()
        };

        if (userId) {
           try {
             const res = await fetch('/api/ingredients', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
               body: JSON.stringify({ ingredients: [{ name: normalized, ...meta }] })
             });
             if (res.ok) {
               const data = await res.json();
               const newItem = data[0];
               set(state => ({
                 pantry: [{
                   id: newItem.id,
                   name: newItem.name,
                   category: newItem.category || '其他',
                   icon: newItem.icon || '🥘',
                   createdAt: new Date(newItem.created_at).getTime(),
                   updatedAt: new Date(newItem.updated_at).getTime()
                 }, ...state.pantry]
               }));
             }
           } catch (e) {
             console.error(e);
           }
        } else {
            set(state => ({ pantry: [optimisticItem, ...state.pantry] }));
        }
      },

      addManyToPantry: async (names) => {
        const normalizedNames = names.map(normalizeIngredientName).filter(Boolean);
        if (normalizedNames.length === 0) return;
        
        const { userId, pantry } = get();
        const existingLower = new Set(pantry.map(i => i.name.toLowerCase()));
        const toAddNames = normalizedNames.filter(n => !existingLower.has(n.toLowerCase()));
        
        if (toAddNames.length === 0) return;

        const toAddItems = toAddNames.map(name => ({
            name,
            ...getIngredientMeta(name)
        }));

        if (userId) {
           try {
             const res = await fetch('/api/ingredients', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
               body: JSON.stringify({ ingredients: toAddItems })
             });
             if (res.ok) {
               const data = await res.json();
               const newItems = data.map((item: any) => ({
                   id: item.id,
                   name: item.name,
                   category: item.category || '其他',
                   icon: item.icon || '🥘',
                   createdAt: new Date(item.created_at).getTime(),
                   updatedAt: new Date(item.updated_at).getTime()
               }));
               set(state => ({ pantry: [...newItems, ...state.pantry] }));
             }
           } catch (e) {
             console.error(e);
           }
        }
      },

      updatePantryItem: async (id, name) => {
        const normalized = normalizeIngredientName(name);
        if (!normalized) return;
        
        const { userId, pantry } = get();
        // Check duplicate with other items
        if (pantry.some(i => i.id !== id && i.name.toLowerCase() === normalized.toLowerCase())) return;

        const meta = getIngredientMeta(normalized);

        if (userId) {
          // Optimistic update
          set(state => ({
            pantry: state.pantry.map(i => i.id === id ? { ...i, name: normalized, ...meta } : i)
          }));
          
          try {
            await fetch(`/api/ingredients/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
              body: JSON.stringify({ name: normalized, ...meta })
            });
          } catch (e) {
            console.error(e);
          }
        }
      },

      removePantryItem: async (id) => {
        const { userId } = get();
        if (userId) {
           // Optimistic
           set(state => ({ pantry: state.pantry.filter(i => i.id !== id) }));
           try {
             await fetch(`/api/ingredients/${id}`, {
               method: 'DELETE',
               headers: { 'x-user-id': userId }
             });
           } catch (e) {
             console.error(e);
           }
        }
      },

      clearPantry: async () => {
         const { userId } = get();
         if (userId) {
           set({ pantry: [] });
           try {
             await fetch('/api/ingredients', {
               method: 'DELETE',
               headers: { 'x-user-id': userId }
             });
           } catch (e) {
             console.error(e);
           }
         }
      }
    }),
    {
      name: 'fast-ai-food-store',
      version: 3, // Increment version for schema change
      partialize: (state) => ({
        ingredients: state.ingredients,
        pantry: state.pantry,
        userId: state.userId,
      }),
    },
  ),
);
