import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'
import integrations from './integrations.tsx'

const app = new Hono()

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Create a regular Supabase client for non-admin operations
const createRegularClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

// User roles enum
const USER_ROLES = {
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  MEDICAL_STAFF: 'Medical Staff',
  MARKETING: 'Marketing Team',
  RECEPTION: 'Reception',
  MANAGER: 'Manager'
} as const

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  
  if (!accessToken) {
    return c.json({ error: 'No authorization token provided' }, 401)
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (error || !user) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  c.set('user', user)
  c.set('userId', user.id)
  await next()
}

// Middleware to require admin role
const requireAdmin = async (c: any, next: any) => {
  const userId = c.get('userId')
  
  try {
    const userData = await kv.get(`user_profile:${userId}`)
    if (!userData || userData.role !== USER_ROLES.ADMIN) {
      return c.json({ error: 'Admin access required' }, 403)
    }
    await next()
  } catch (error) {
    console.log('Error checking admin status:', error)
    return c.json({ error: 'Failed to verify admin status' }, 500)
  }
}

// Health check endpoint
app.get('/make-server-a5e3056d/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Sign up endpoint (admin only)
app.post('/make-server-a5e3056d/signup', requireAuth, requireAdmin, async (c) => {
  try {
    const { email, password, name, role } = await c.req.json()
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Email, password, name, and role are required' }, 400)
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role as UserRole)) {
      return c.json({ error: 'Invalid role specified' }, 400)
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    })

    if (error) {
      console.log('Supabase auth error:', error)
      return c.json({ error: `Failed to create user: ${error.message}` }, 400)
    }

    if (!data.user) {
      return c.json({ error: 'User creation failed - no user data returned' }, 500)
    }

    // Store additional user profile data in KV store
    const userProfile = {
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      created_by: c.get('userId')
    }

    await kv.set(`user_profile:${data.user.id}`, userProfile)
    
    // Also store in users list for easy retrieval
    const existingUsers = await kv.get('users_list') || []
    existingUsers.push(userProfile)
    await kv.set('users_list', existingUsers)

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email,
        name,
        role
      }
    })
  } catch (error) {
    console.log('Error creating user:', error)
    return c.json({ error: 'Internal server error during user creation' }, 500)
  }
})

// Get all users (admin only)
app.get('/make-server-a5e3056d/users', requireAuth, requireAdmin, async (c) => {
  try {
    const users = await kv.get('users_list') || []
    return c.json({ users })
  } catch (error) {
    console.log('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Get user profile
app.get('/make-server-a5e3056d/profile', requireAuth, async (c) => {
  const userId = c.get('userId')
  
  try {
    const userProfile = await kv.get(`user_profile:${userId}`)
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404)
    }

    return c.json({ user: userProfile })
  } catch (error) {
    console.log('Error fetching user profile:', error)
    return c.json({ error: 'Failed to fetch user profile' }, 500)
  }
})

// Update user role (admin only)
app.put('/make-server-a5e3056d/users/:userId/role', requireAuth, requireAdmin, async (c) => {
  try {
    const targetUserId = c.req.param('userId')
    const { role } = await c.req.json()

    if (!Object.values(USER_ROLES).includes(role as UserRole)) {
      return c.json({ error: 'Invalid role specified' }, 400)
    }

    // Get current user profile
    const userProfile = await kv.get(`user_profile:${targetUserId}`)
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Update role
    userProfile.role = role
    userProfile.updated_at = new Date().toISOString()
    userProfile.updated_by = c.get('userId')

    await kv.set(`user_profile:${targetUserId}`, userProfile)

    // Update in users list
    const users = await kv.get('users_list') || []
    const updatedUsers = users.map((user: any) => 
      user.id === targetUserId ? userProfile : user
    )
    await kv.set('users_list', updatedUsers)

    return c.json({ success: true, user: userProfile })
  } catch (error) {
    console.log('Error updating user role:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Delete user (admin only)
app.delete('/make-server-a5e3056d/users/:userId', requireAuth, requireAdmin, async (c) => {
  try {
    const targetUserId = c.req.param('userId')
    const currentUserId = c.get('userId')

    // Prevent self-deletion
    if (targetUserId === currentUserId) {
      return c.json({ error: 'Cannot delete your own account' }, 400)
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId)
    if (authError) {
      console.log('Error deleting user from auth:', authError)
      return c.json({ error: 'Failed to delete user from authentication system' }, 500)
    }

    // Delete user profile from KV store
    await kv.del(`user_profile:${targetUserId}`)

    // Remove from users list
    const users = await kv.get('users_list') || []
    const updatedUsers = users.filter((user: any) => user.id !== targetUserId)
    await kv.set('users_list', updatedUsers)

    return c.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.log('Error deleting user:', error)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

// Get available roles
app.get('/make-server-a5e3056d/roles', requireAuth, (c) => {
  return c.json({ roles: Object.values(USER_ROLES) })
})

// Initialize admin user if none exists
app.post('/make-server-a5e3056d/init-admin', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    // Check if any admin users exist
    const users = await kv.get('users_list') || []
    const hasAdmin = users.some((user: any) => user.role === USER_ROLES.ADMIN)
    
    if (hasAdmin) {
      return c.json({ error: 'Admin user already exists' }, 400)
    }

    // Create the first admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: USER_ROLES.ADMIN },
      email_confirm: true
    })

    if (error) {
      console.log('Error creating admin user:', error)
      return c.json({ error: `Failed to create admin user: ${error.message}` }, 500)
    }

    if (!data.user) {
      return c.json({ error: 'Admin user creation failed' }, 500)
    }

    // Store admin profile
    const adminProfile = {
      id: data.user.id,
      email,
      name,
      role: USER_ROLES.ADMIN,
      created_at: new Date().toISOString(),
      is_initial_admin: true
    }

    await kv.set(`user_profile:${data.user.id}`, adminProfile)
    await kv.set('users_list', [adminProfile])

    return c.json({ 
      success: true, 
      message: 'Initial admin user created successfully',
      user: {
        id: data.user.id,
        email,
        name,
        role: USER_ROLES.ADMIN
      }
    })
  } catch (error) {
    console.log('Error initializing admin:', error)
    return c.json({ error: 'Failed to initialize admin user' }, 500)
  }
})

// Mount integrations routes
app.route('/make-server-a5e3056d', integrations)

Deno.serve(app.fetch)