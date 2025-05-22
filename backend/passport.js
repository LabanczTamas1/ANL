const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { v4: uuidv4 } = require("uuid");
const redisClient = require("./redisClient"); // Make sure this path is correct
require("dotenv").config();

console.log("passport.js-----------------");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

// Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "278917364562-62e4t4j74hc7v0efe8ksa6p48la095k2.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      callbackURL: "http://localhost:3001/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists based on email
        const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!userEmail) {
          return done(new Error("No email found in profile"), null);
        }

        // Determine user role based on email domain or specific emails
        let userRole = "user"; // Default role
        
        // Check for specific admin emails
        if (
          userEmail === process.env.ADMIN_GOOGLE_EMAIL ||
          userEmail === "deid.unideb@gmail.com"
        ) {
          userRole = "admin";
        } 
        // Check for company domain emails
        else if (userEmail.endsWith('@yourcompany.com')) {
          userRole = "admin";
        }

        const userKey = `user:email:${userEmail}`;
        const userExists = await redisClient.exists(userKey);

        if (userExists) {
          // Get existing user
          const userId = await redisClient.get(userKey);
          const userData = await redisClient.hGetAll(`user:${userId}`);
          
          // Return the user with their existing data - no updates
          console.log("User login with data:", userData);
          return done(null, { id: userId, ...userData });
        } else {
          // Create new user
          const userId = uuidv4();
          const username = profile.displayName
            ? profile.displayName.toLowerCase().replace(/\s/g, "")
            : userEmail.split("@")[0];

          const newUser = {
            id: userId,
            email: userEmail,
            username: username,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            provider: "google",
            role: userRole, // Set the determined role
            googleId: profile.id,
            createdAt: new Date().toISOString(),
          };

          // Store in Redis
          await redisClient.set(userKey, userId);
          await redisClient.hSet(`user:${userId}`, newUser);

          return done(null, newUser);
        }
      } catch (error) {
        console.error("Error in Google auth strategy:", error);
        return done(error, false);
      }
    }
  )
);

// Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3001/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "name"], // remove 'email' temporarily
      scope: ["public_profile"], // no email
      passReqToCallback: true,
      enableProof: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Callback hit!");
      console.log("Facebook Profile:", profile);
      try {
        console.log("Facebook profile received:", profile); // Add this for debugging

        // Check if user exists based on email or Facebook ID
        const userEmail =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        // Try to find by email first if available
        if (userEmail) {
          const userKey = `user:email:${userEmail}`;
          const userExists = await redisClient.exists(userKey);

          if (userExists) {
            const userId = await redisClient.get(userKey);
            const userData = await redisClient.hGetAll(`user:${userId}`);
            return done(null, { id: userId, ...userData });
          }
        }

        // Try to find by Facebook ID
        const facebookIdKey = `user:facebook:${profile.id}`;
        const userByFbExists = await redisClient.exists(facebookIdKey);

        if (userByFbExists) {
          const userId = await redisClient.get(facebookIdKey);
          const userData = await redisClient.hGetAll(`user:${userId}`);
          return done(null, { id: userId, ...userData });
        }

        // Create new user if not found
        const userId = uuidv4();
        const username = profile.displayName
          ? profile.displayName.toLowerCase().replace(/\s/g, "")
          : userEmail
          ? userEmail.split("@")[0]
          : `fb_${profile.id}`;

        const newUser = {
          id: userId,
          email: userEmail || `${profile.id}@facebook.com`,
          username: username,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          provider: "facebook",
          facebookId: profile.id,
          role: "user",
          createdAt: new Date().toISOString(),
        };

        // Store in Redis
        if (userEmail) {
          await redisClient.set(`user:email:${userEmail}`, userId);
        }
        await redisClient.set(`user:facebook:${profile.id}`, userId);
        await redisClient.hSet(`user:${userId}`, newUser);

        return done(null, newUser);
      } catch (error) {
        console.error("Error in Facebook auth strategy:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userData = await redisClient.hGetAll(`user:${id}`);
    if (!userData || Object.keys(userData).length === 0) {
      return done(new Error("User not found"), null);
    }
    done(null, userData);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
