import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Middleware to get user_id from header
const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// GET /api/ingredients
router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'User ID required' });

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get ingredients error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// POST /api/ingredients
// Supports single object or array of names
router.post('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'User ID required' });

  const { ingredients } = req.body; // Expecting array of names or objects

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients array required' });
  }
  
  if (ingredients.length === 0) {
    return res.json([]);
  }

  // Get current date for purchase_date
  const now = new Date();
  const purchaseDate = now.toISOString().split('T')[0];
  
  // Default expiry date: 7 days later
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const toInsert = ingredients.map((item: any) => {
    const name = typeof item === 'string' ? item : item.name;
    return {
      user_id: userId,
      name: name,
      quantity: 1, // Default
      unit: '个', // Default
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
    };
  });

  const { data, error } = await supabase
    .from('ingredients')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('Add ingredients error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// PUT /api/ingredients/:id
router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'User ID required' });
  const { id } = req.params;
  const updates = req.body;

  // Prevent updating restricted fields
  delete updates.id;
  delete updates.user_id;
  delete updates.created_at;

  const { data, error } = await supabase
    .from('ingredients')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update ingredient error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// DELETE /api/ingredients/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'User ID required' });
  const { id } = req.params;

  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Delete ingredient error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

// DELETE /api/ingredients (Clear all)
router.delete('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'User ID required' });

  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Clear ingredients error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

export default router;
