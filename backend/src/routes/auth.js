import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { getPublicAppOrigin } from '../utils/publicUrl.js';
import { register, login, getMe, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

const ROOM_PATH = /^\/(?:room|meeting)\/[a-zA-Z0-9\-]+\/?$/;

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

// Google OAuth — store invite path so callback can return to /room/:id instead of /
router.get('/google', (req, res, next) => {
  if (!config.google?.clientId || !config.google?.clientSecret) {
    const base = getPublicAppOrigin();
    return res.redirect(`${base}/?error=${encodeURIComponent('Google authentication is not configured on this server. Please use email and password.')}`);
  }

  const raw = req.query.returnTo;
  if (typeof raw === 'string' && ROOM_PATH.test(raw.split('?')[0])) {
    const returnPath = raw.split('?')[0];
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('oauth_return_to', returnPath, {
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!config.google?.clientId || !config.google?.clientSecret) {
      const base = getPublicAppOrigin();
      return res.redirect(`${base}/?error=${encodeURIComponent('Google authentication is not configured on this server.')}`);
    }
    passport.authenticate('google', { session: false })(req, res, next);
  },
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );

    const base = getPublicAppOrigin();
    let returnPath = req.cookies?.oauth_return_to;
    res.clearCookie('oauth_return_to', { path: '/' });
    if (typeof returnPath !== 'string' || !ROOM_PATH.test(returnPath)) {
      returnPath = '';
    }

    const query = `token=${encodeURIComponent(token)}&username=${encodeURIComponent(req.user.username)}`;
    const redirectUrl = returnPath ? `${base}${returnPath}?${query}` : `${base}/?${query}`;
    res.redirect(redirectUrl);
  }
);

export default router;
