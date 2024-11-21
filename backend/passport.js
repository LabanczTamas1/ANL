const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();


console.log("passport.js-----------------");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

// Google strategy
passport.use(new GoogleStrategy({
    clientID: "278917364562-62e4t4j74hc7v0efe8ksa6p48la095k2.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

// Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'photos']
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));



// Serialize and deserialize user
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
