// src/config/oauth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const prisma = require('./prisma');

const setupOAuth = () => {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          displayName: true
        }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_BASE_URL}/api/auth/google/callback`,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          email: profile.emails[0].value
        }
      });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            displayName: profile.displayName,
            passwordHash: '', // OAuth users don't have passwords
            oauthProvider: 'google',
            oauthId: profile.id
          }
        });
      } else if (!user.oauthId) {
        // Link existing account with Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'google',
            oauthId: profile.id
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Configure Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.API_BASE_URL}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          email: profile.emails[0].value
        }
      });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            displayName: profile.displayName,
            passwordHash: '', // OAuth users don't have passwords
            oauthProvider: 'facebook',
            oauthId: profile.id
          }
        });
      } else if (!user.oauthId) {
        // Link existing account with Facebook
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'facebook',
            oauthId: profile.id
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  return passport;
};

module.exports = { setupOAuth };