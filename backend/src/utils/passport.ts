import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/database.js';
import { env } from '../config/env.js';
import { createLogger } from './logger.js';

const logger = createLogger('passport', 'infra');

// ---------------------------------------------------------------------------
// Google Strategy
// ---------------------------------------------------------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.BACKEND_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req: any, accessToken, refreshToken, profile, done) => {
      try {
        const redisClient = getRedisClient();
        const userEmail =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null;

        if (!userEmail) {
          return done(new Error('No email found in profile'), undefined);
        }

        let userRole = 'user';
        if (
          userEmail === env.ADMIN_GOOGLE_EMAIL ||
          userEmail === 'deid.unideb@gmail.com'
        ) {
          userRole = 'admin';
        } else if (userEmail.endsWith('@yourcompany.com')) {
          userRole = 'admin';
        }

        const userKey = `user:email:${userEmail}`;
        const userExists = await redisClient.exists(userKey);

        if (userExists) {
          const userId = await redisClient.get(userKey);
          const userData = await redisClient.hGetAll(`user:${userId}`);
          return done(null, { id: userId!, ...userData } as Express.User);
        }

        const userId = uuidv4();
        const username = profile.displayName
          ? profile.displayName.toLowerCase().replace(/\s/g, '')
          : userEmail.split('@')[0];

        const newUser: Record<string, string> = {
          id: userId,
          email: userEmail,
          username,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          provider: 'google',
          role: userRole,
          googleId: profile.id,
          createdAt: new Date().toISOString(),
        };

        await redisClient.set(userKey, userId);
        await redisClient.hSet(`user:${userId}`, newUser);
        await redisClient.set(`user:username:${username}`, userId);

        return done(null, newUser as unknown as Express.User);
      } catch (error) {
        logger.error({ err: error }, 'Error in Google auth strategy');
        return done(error as Error, undefined);
      }
    },
  ),
);

// ---------------------------------------------------------------------------
// Facebook Strategy
// ---------------------------------------------------------------------------
passport.use(
  new FacebookStrategy(
    {
      clientID: env.FACEBOOK_APP_ID,
      clientSecret: env.FACEBOOK_APP_SECRET,
      callbackURL: `${env.BACKEND_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'name'],
      scope: ['public_profile'],
      passReqToCallback: true,
      enableProof: true,
    } as any,
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const redisClient = getRedisClient();
        const userEmail =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null;

        if (userEmail) {
          const userKey = `user:email:${userEmail}`;
          const userExists = await redisClient.exists(userKey);

          if (userExists) {
            const userId = await redisClient.get(userKey);
            const userData = await redisClient.hGetAll(`user:${userId}`);
            return done(null, { id: userId, ...userData });
          }
        }

        const facebookIdKey = `user:facebook:${profile.id}`;
        const userByFbExists = await redisClient.exists(facebookIdKey);

        if (userByFbExists) {
          const userId = await redisClient.get(facebookIdKey);
          const userData = await redisClient.hGetAll(`user:${userId}`);
          return done(null, { id: userId, ...userData });
        }

        const userId = uuidv4();
        const username = profile.displayName
          ? profile.displayName.toLowerCase().replace(/\s/g, '')
          : userEmail
            ? userEmail.split('@')[0]
            : `fb_${profile.id}`;

        const newUser: Record<string, string> = {
          id: userId,
          email: userEmail || `${profile.id}@facebook.com`,
          username,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          provider: 'facebook',
          facebookId: profile.id,
          role: 'user',
          createdAt: new Date().toISOString(),
        };

        if (userEmail) {
          await redisClient.set(`user:email:${userEmail}`, userId);
        }
        await redisClient.set(`user:facebook:${profile.id}`, userId);
        await redisClient.hSet(`user:${userId}`, newUser);

        return done(null, newUser);
      } catch (error) {
        logger.error({ err: error }, 'Error in Facebook auth strategy');
        return done(error, false);
      }
    },
  ),
);

// ---------------------------------------------------------------------------
// Serialize / Deserialize
// ---------------------------------------------------------------------------
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const redisClient = getRedisClient();
    const userData = await redisClient.hGetAll(`user:${id}`);
    if (!userData || Object.keys(userData).length === 0) {
      return done(new Error('User not found'), null);
    }
    done(null, userData as unknown as Express.User);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
