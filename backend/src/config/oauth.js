const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('./prisma');

const setupOAuth = () => {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
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
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  // Configure Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/api/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile received:', profile.emails[0].value);
      
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
            displayName: profile.displayName || profile.emails[0].value.split('@')[0],
            passwordHash: '', // OAuth users don't have passwords
            oauthProvider: 'google',
            oauthId: profile.id
          }
        });
        console.log('Created new user:', user.id);
      } else if (!user.oauthId) {
        // Link existing account with Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'google',
            oauthId: profile.id
          }
        });
        console.log('Updated existing user with OAuth info:', user.id);
      }

      return done(null, user);
    } catch (error) {
      console.error('Error in Google authentication:', error);
      return done(error, null);
    }
  }));

  // Configure GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/api/auth/github/callback',
    scope: ['user:email'] // Request email access
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub profile received:', profile);
      
      // GitHub may not return email directly, so we need to handle this case
      let email;
      
      // Try to get email from profile
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else {
        // If email not provided directly, use username@github.com as fallback
        email = `${profile.username}@github.com`;
        console.log('No email provided by GitHub, using fallback:', email);
      }
      
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { 
              oauthProvider: 'github',
              oauthId: profile.id 
            }
          ]
        }
      });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            email,
            displayName: profile.displayName || profile.username,
            passwordHash: '', // OAuth users don't have passwords
            oauthProvider: 'github',
            oauthId: profile.id
          }
        });
        console.log('Created new user:', user.id);
      } else if (!user.oauthId || user.oauthProvider !== 'github') {
        // Link existing account with GitHub
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'github',
            oauthId: profile.id
          }
        });
        console.log('Updated existing user with GitHub OAuth info:', user.id);
      }

      return done(null, user);
    } catch (error) {
      console.error('Error in GitHub authentication:', error);
      return done(error, null);
    }
  }));

  return passport;
};

module.exports = { setupOAuth };