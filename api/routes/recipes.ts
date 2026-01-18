import express from 'express';
import { supabase } from '../lib/supabase.js';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const router = express.Router();

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

// Schema for recipe generation
const recipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string().optional()
  })),
  steps: z.array(z.object({
    step_number: z.number(),
    instruction: z.string(),
    duration: z.string().optional()
  })),
  cooking_time: z.number().describe('Total cooking time in minutes'),
  difficulty: z.enum(['简单', '中等', '困难']),
  cuisine_type: z.string(),
  calories: z.number().optional(),
  reason: z.string().describe('Why this recipe is recommended based on ingredients')
});

// POST /api/recipes/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { ingredients, cuisine_type, difficulty, ai_creative } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    // 1. Search Local Database
    // Simple search: find recipes that contain ANY of the ingredients in their name or ingredients list
    // Using ILIKE on casted text for simplicity in this prototype
    let query = supabase.from('recipes').select('*');
    
    // Construct OR filter for ingredients
    const orConditions = ingredients.map(ing => `ingredients.ilike.%${ing}%,name.ilike.%${ing}%`).join(',');
    query = query.or(orConditions);

    if (cuisine_type) {
      query = query.eq('cuisine_type', cuisine_type);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: localRecipes, error: dbError } = await query.limit(5);

    if (dbError) {
      console.error('Database search error:', dbError);
      // Continue to AI even if DB fails? No, simpler to just return empty local
    }

    let aiRecipes: any[] = [];
    let aiCreativityScore = 0;

    // 2. AI Recommendation (if enabled or no local results)
    if (ai_creative || !localRecipes || localRecipes.length === 0) {
      try {
        const prompt = `
          Generate 2 creative Chinese home-style recipes using these ingredients: ${ingredients.join(', ')}.
          ${cuisine_type ? `Cuisine style: ${cuisine_type}.` : 'Style: Chinese Home Cooking.'}
          ${difficulty ? `Difficulty: ${difficulty}.` : ''}
          Focus on using the provided ingredients, but you can add common Chinese pantry items (soy sauce, ginger, garlic, oil, etc.).
          Provide the output in Chinese (Simplified).
        `;

        const { object } = await generateObject({
          model: deepseek('deepseek-chat'), 
          schema: z.object({
            recipes: z.array(recipeSchema),
            creativity_score: z.number().min(0).max(100)
          }),
          prompt: prompt,
        });

        aiRecipes = object.recipes;
        aiCreativityScore = object.creativity_score;
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Fallback or ignore AI error
      }
    }

    res.json({
      local_recipes: localRecipes || [],
      ai_recipes: aiRecipes,
      match_scores: {}, // Placeholder
      ai_creativity_score: aiCreativityScore
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recipes/ai-creative
router.post('/ai-creative', async (req, res) => {
  try {
    const { ingredients, creativity_level } = req.body;

    const prompt = `
      Generate a VERY CREATIVE Chinese recipe using: ${ingredients.join(', ')}.
      Creativity Level: ${creativity_level || 'balanced'}.
      Think outside the box. Combine flavors in unexpected ways, but keep it edible and delicious.
      Output in Chinese (Simplified).
    `;

    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      schema: z.object({
        recipe: recipeSchema,
        explanation: z.string(),
        success_rate: z.number()
      }),
      prompt: prompt,
    });

    res.json({
      ai_recipes: [object.recipe],
      creativity_explanation: object.explanation,
      estimated_success_rate: object.success_rate
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  // Check if it's a valid UUID (Local DB)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Recipe not found' });
    return res.json({ ...data, recipe_source: 'local' });
  } else {
    // If ID is not UUID, maybe it's a temporary AI ID or handle error
    return res.status(404).json({ error: 'Recipe not found (AI recipes are not persisted yet)' });
  }
});

export default router;
