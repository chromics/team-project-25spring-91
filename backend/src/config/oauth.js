const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
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
  // passport.use(new GoogleStrategy({
  //   clientID: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   callbackURL: 'http://localhost:5000/api/auth/google/callback',
  //   scope: ['profile', 'email']
  // }, async (accessToken, refreshToken, profile, done) => {
  //   try {
  //     console.log('Google profile received:', profile.emails[0].value);

  //     // Check if user exists
  //     let user = await prisma.user.findFirst({
  //       where: {
  //         email: profile.emails[0].value
  //       }
  //     });

  //     if (!user) {
  //       // Create new user if not found
  //       user = await prisma.user.create({
  //         data: {
  //           email: profile.emails[0].value,
  //           displayName: profile.displayName || profile.emails[0].value.split('@')[0],
  //           passwordHash: '', // OAuth users don't have passwords
  //           oauthProvider: 'google',
  //           oauthId: profile.id
  //         }
  //       });
  //       console.log('Created new user:', user.id);
  //     } else if (!user.oauthId) {
  //       // Link existing account with Google
  //       user = await prisma.user.update({
  //         where: { id: user.id },
  //         data: {
  //           oauthProvider: 'google',
  //           oauthId: profile.id
  //         }
  //       });
  //       console.log('Updated existing user with OAuth info:', user.id);
  //     }

  //     return done(null, user);
  //   } catch (error) {
  //     console.error('Error in Google authentication:', error);
  //     return done(error, null);
  //   }
  // }));
  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: "http://localhost:5000/api/auth/google/callback",
  //       scope: ["profile", "email"],
  //       proxy: true,
  //       timeout: 60000
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         console.log("Google profile received:", profile);

  //         // Make sure we have an email
  //         if (!profile.emails || profile.emails.length === 0) {
  //           return done(new Error("No email provided by Google"), null);
  //         }

  //         const email = profile.emails[0].value;

  //         // Find by email only
  //         let user = await prisma.user.findUnique({
  //           where: { email: email }
  //         });

  //         if (!user) {
  //           // Create new user
  //           user = await prisma.user.create({
  //             data: {
  //               email: email,
  //               passwordHash: "",
  //               displayName: profile.displayName || email.split("@")[0],
  //               oauthProvider: "google",
  //               oauthId: profile.id.toString()
  //             }
  //           });
  //           console.log("Created new user:", user);
  //         } else {
  //           // Update existing user
  //           user = await prisma.user.update({
  //             where: { id: user.id },
  //             data: {
  //               oauthProvider: "google",
  //               oauthId: profile.id.toString()
  //             }
  //           });
  //           console.log("Updated user with OAuth info:", user);
  //         }

  //         return done(null, user);
  //       } catch (error) {
  //         console.error("Error in Google authentication:", error);
  //         return done(error, null);
  //       }
  //     }
  //   )
  // );


  // Configure GitHub Strategy
  // passport.use(new GitHubStrategy({
  //   clientID: process.env.GITHUB_CLIENT_ID,
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
  //   callbackURL: 'http://localhost:5000/api/auth/github/callback',
  //   scope: ['user:email'] // Request email access
  // }, async (accessToken, refreshToken, profile, done) => {
  //   try {
  //     console.log('GitHub profile received:', profile);

  //     // GitHub may not return email directly, so we need to handle this case
  //     let email;

  //     // Try to get email from profile
  //     if (profile.emails && profile.emails.length > 0) {
  //       email = profile.emails[0].value;
  //     } else {
  //       // If email not provided directly, use username@github.com as fallback
  //       email = `${profile.username}@github.com`;
  //       console.log('No email provided by GitHub, using fallback:', email);
  //     }

  //     // Check if user exists
  //     let user = await prisma.user.findFirst({
  //       where: {
  //         OR: [
  //           { email },
  //           { 
  //             oauthProvider: 'github',
  //             oauthId: profile.id
  //           }
  //         ]
  //       }
  //     });

  //     if (!user) {
  //       // Create new user if not found
  //       user = await prisma.user.create({
  //         data: {
  //           email,
  //           displayName: profile.displayName || profile.username,
  //           passwordHash: '', // OAuth users don't have passwords
  //           oauthProvider: 'github',
  //           oauthId: profile.id
  //         }
  //       });
  //       console.log('Created new user:', user.id);
  //     } else if (!user.oauthId || user.oauthProvider !== 'github') {
  //       // Link existing account with GitHub
  //       user = await prisma.user.update({
  //         where: { id: user.id },
  //         data: {
  //           oauthProvider: 'github',
  //           oauthId: profile.id
  //         }
  //       });
  //       console.log('Updated existing user with GitHub OAuth info:', user.id);
  //     }

  //     return done(null, user);
  //   } catch (error) {
  //     console.error('Error in GitHub authentication:', error);
  //     return done(error, null);
  //   }
  // }));

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/github/callback",
        scope: ["user:email"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("GitHub profile received:", profile);

          let email;
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
          } else {
            email = `${profile.username}@github.com`;
          }

          // Find by email only
          let user = await prisma.user.findUnique({
            where: { email: email }
          });

          if (!user) {
            // Create new user with all fields
            user = await prisma.user.create({
              data: {
                email: email,
                passwordHash: "",
                displayName: profile.displayName || profile.username,
                oauthProvider: "github",
                oauthId: profile.id.toString()
              }
            });
            console.log("Created new user:", user);
          } else {
            // Update existing user with OAuth info
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                oauthProvider: "github",
                oauthId: profile.id.toString()
              }
            });
            console.log("Updated user with OAuth info:", user);
          }

          return done(null, user);
        } catch (error) {
          console.error("Error in GitHub authentication:", error);
          return done(error, null);
        }
      }
    )
  );


  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/microsoft/callback",
        scope: ["user.read"], // Request basic profile and email
        // Use 'common' tenant to allow both personal and work/school accounts
        tenant: "common",
        // Optional: Define authorization and token endpoints explicitly if needed
        // authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        // tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Microsoft profile received:", profile);

          // Extract email - Microsoft profiles might provide it in different places
          // Prioritize primary email, fallback to User Principal Name if needed
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : profile._json?.userPrincipalName || profile._json?.mail;

          if (!email) {
            console.error("Microsoft profile:", profile); // Log profile if email is missing
            return done(
              new Error("No email found in Microsoft profile"),
              null
            );
          }

          // Find by email only
          let user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            // Create new user with all fields
            user = await prisma.user.create({
              data: {
                email: email,
                passwordHash: "", // No password for OAuth users
                // Use displayName, fallback to email prefix
                displayName: profile.displayName || email.split("@")[0],
                oauthProvider: "microsoft",
                oauthId: profile.id.toString(), // Microsoft profile ID
              },
            });
            console.log("Created new user via Microsoft:", user);
          } else {
            // Update existing user with OAuth info if not already linked
            // or if they previously used a different provider
            if (
              !user.oauthId ||
              !user.oauthProvider ||
              user.oauthProvider !== "microsoft"
            ) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  oauthProvider: "microsoft",
                  oauthId: profile.id.toString(),
                  // Optionally update displayName if it was missing or generic
                  displayName: user.displayName || profile.displayName || email.split("@")[0],
                },
              });
              console.log("Updated user with Microsoft OAuth info:", user);
            } else {
              console.log("User already linked with Microsoft:", user);
            }
          }

          return done(null, user);
        } catch (error) {
          console.error("Error in Microsoft authentication:", error);
          return done(error, null);
        }
      }
    )
  );

  return passport;
};

module.exports = { setupOAuth };