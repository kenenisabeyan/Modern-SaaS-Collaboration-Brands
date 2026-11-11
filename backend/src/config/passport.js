import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Op } from 'sequelize';
import config from './config.js';
import models from '../database/index.js';

const { User } = models;

const normalizeUsername = (raw) => {
  if (typeof raw !== 'string') return 'user';
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');
  return cleaned.length >= 3 ? cleaned : 'user';
};

const generateUniqueUsername = async (preferred, excludeUserId = null) => {
  const base = normalizeUsername(preferred);
  const buildWhere = (username) => {
    const where = { username };
    if (excludeUserId) {
      where.id = { [Op.ne]: excludeUserId };
    }
    return where;
  };

  const existingBase = await User.findOne({ where: buildWhere(base) });
  if (!existingBase) return base;

  for (let i = 0; i < 20; i += 1) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const candidate = `${base}_${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const existing = await User.findOne({ where: buildWhere(candidate) });
    if (!existing) return candidate;
  }

  // Fallback (extremely unlikely)
  return `${base}_${Date.now().toString(36)}`;
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (config.google?.clientId && config.google?.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl ? config.google.callbackUrl : '/api/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const rawUsername = profile.displayName || email.split('@')[0];
          const googleId = profile.id;

          let user = await User.findOne({ where: { email } });
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          if (user) {
            // Sync username and googleId for existing users
            const updates = {};
            if (!user.googleId) updates.googleId = googleId;
            if (avatar && user.avatar !== avatar) updates.avatar = avatar;
            
            // Update username to Google name if it's different
            if (rawUsername && user.username !== rawUsername) {
              const uniqueUsername = await generateUniqueUsername(rawUsername, user.id);
              if (uniqueUsername && uniqueUsername !== user.username) {
                updates.username = uniqueUsername;
              }
            }

            if (Object.keys(updates).length > 0) {
              await user.update(updates);
            }
            return done(null, user);
          }

          const username = await generateUniqueUsername(rawUsername);

          user = await User.create({
            username,
            email,
            googleId,
            avatar,
            password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          });

          console.log(`Google OAuth user created: ${username} (${email}) with Google ID: ${googleId}`);
          done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('[Auth] Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) not set. Standard email/password authentication is active.');
}

export default passport;
