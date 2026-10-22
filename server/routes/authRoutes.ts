import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { User, Profile, Artisan } from '../types';

export const authRouter = Router();

// Register
authRouter.post('/register', (req: Request, res: Response): void => {
  try {
    const { email, password, full_name, phone, role = 'customer', brand_name, craft_type, location } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required' });
      return;
    }

    const users = db.get('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const userId = `usr-${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      password_hash,
      full_name,
      phone,
      role: role === 'artisan' || role === 'admin' ? role : 'customer',
      created_at: new Date().toISOString()
    };

    const newProfile: Profile = {
      id: `prof-${Date.now()}`,
      user_id: userId,
      bio: role === 'artisan' ? `${craft_type || 'Handicrafts'} artisan based in ${location || 'India'}.` : 'Handmade handicraft enthusiast.',
      default_currency: 'USD',
      country: role === 'artisan' ? 'India' : 'United States',
      city: location || (role === 'artisan' ? 'Rural Workshop' : 'New York')
    };

    db.mutate(draft => {
      draft.users.push(newUser);
      draft.profiles.push(newProfile);

      // If registered as artisan, create artisan record
      if (role === 'artisan') {
        const newArtisan: Artisan = {
          id: `art-${Date.now()}`,
          user_id: userId,
          brand_name: brand_name || `${full_name}'s Handicrafts`,
          craft_type: craft_type || 'Traditional Crafts',
          story: `${full_name} is dedicated to sustaining generational rural craft heritage.`,
          location: location || 'Rural Workshop, India',
          village: location?.split(',')[0] || 'Artisan Village',
          state: location?.split(',')[1]?.trim() || 'India',
          country: 'India',
          verified: false,
          rating: 5.0,
          total_sales: 0,
          image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
          phone: phone || '+91 90000 00000',
          iec_code: '0519' + Math.floor(100000 + Math.random() * 900000)
        };
        draft.artisans.push(newArtisan);
      }
    });

    const token = generateToken(newUser);
    const artisans = db.get('artisans');
    const artisanData = artisans.find(a => a.user_id === userId);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone
      },
      profile: newProfile,
      artisan: artisanData || null
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// Login
authRouter.post('/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const users = db.get('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const profiles = db.get('profiles');
    const profile = profiles.find(p => p.user_id === user.id);
    const artisans = db.get('artisans');
    const artisan = artisans.find(a => a.user_id === user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone
      },
      profile: profile || null,
      artisan: artisan || null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo Instant 1-Click Login (Admin, Artisan, Customer)
authRouter.post('/demo-login', (req: Request, res: Response): void => {
  try {
    const { role = 'customer' } = req.body;
    const users = db.get('users');
    let user = users.find(u => u.role === role);

    if (!user) {
      user = users[0];
    }

    const token = generateToken(user);
    const profiles = db.get('profiles');
    const profile = profiles.find(p => p.user_id === user.id);
    const artisans = db.get('artisans');
    const artisan = artisans.find(a => a.user_id === user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone
      },
      profile: profile || null,
      artisan: artisan || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Demo login failed' });
  }
});

// Get Current User Profile
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const profiles = db.get('profiles');
  const profile = profiles.find(p => p.user_id === req.user!.id);
  const artisans = db.get('artisans');
  const artisan = artisans.find(a => a.user_id === req.user!.id);

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      phone: req.user.phone
    },
    profile: profile || null,
    artisan: artisan || null
  });
});
