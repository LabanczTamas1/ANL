import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { createLogger } from './logger.js';
import * as userRepo from '../domains/user/repository/userRepository.js';

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

        const existing = await userRepo.findByEmail(userEmail);
        if (existing) {
          return done(null, {
            id: existing.id,
            email: existing.email,
            username: existing.username,
            role: existing.role,
            accessToken,
            refreshToken,
          } as unknown as Express.User);
        }

        const userId = uuidv4();
        const username = profile.displayName
          ? profile.displayName.toLowerCase().replace(/\s/g, '')
          : userEmail.split('@')[0];

        const newUser = await userRepo.createUser({
          id: userId,
          email: userEmail,
          username,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          provider: 'google',
          role: userRole,
          googleId: profile.id,
        });

        return done(null, {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          accessToken,
          refreshToken,
        } as unknown as Express.User);
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
        const userEmail =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null;

        if (userEmail) {
          const existing = await userRepo.findByEmail(userEmail);
          if (existing) {
            return done(null, {
              id: existing.id,
              email: existing.email,
              username: existing.username,
              role: existing.role,
            });
          }
        }

        const existingByFb = await userRepo.findByFacebookId(profile.id);
        if (existingByFb) {
          return done(null, {
            id: existingByFb.id,
            email: existingByFb.email,
            username: existingByFb.username,
            role: existingByFb.role,
          });
        }

        const userId = uuidv4();
        const username = profile.displayName
          ? profile.displayName.toLowerCase().replace(/\s/g, '')
          : userEmail
            ? userEmail.split('@')[0]
            : `fb_${profile.id}`;

        const newUser = await userRepo.createUser({
          id: userId,
          email: userEmail || `${profile.id}@facebook.com`,
          username,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          provider: 'facebook',
          facebookId: profile.id,
          role: 'user',
        });

        return done(null, {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
        });
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
    const user = await userRepo.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    } as unknown as Express.User);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
