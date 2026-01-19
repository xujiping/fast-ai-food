/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

/**
 * Guest Login (Create anonymous user)
 * POST /api/auth/guest
 */
router.post('/guest', async (req: Request, res: Response): Promise<void> => {
  try {
    // Limit phone length to 20 chars
    // Format: g_ + timestamp(base36) + random(base36)
    // timestamp(base36) is ~8 chars. random can be 8 chars.
    // g_ + 8 + 8 = 18 chars.
    const guestPhone = `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        phone: guestPhone,
        name: 'Guest User',
      })
      .select()
      .single()

    if (error) {
      console.error('Create guest user error:', error)
      res.status(500).json({ error: 'Failed to create guest user' })
      return
    }

    res.json({ user: data })
  } catch (error) {
    console.error('Guest login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  void req
  void res
  // TODO: Implement register logic
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  void req
  void res
  // TODO: Implement login logic
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  void req
  void res
  // TODO: Implement logout logic
})

export default router
