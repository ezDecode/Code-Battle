const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialize/Deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only initialize if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          user.lastActive = new Date();
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        leetcodeUsername: '', // Will be set during onboarding
        password: 'oauth-user', // Placeholder for OAuth users
        avatar: profile.photos[0]?.value || null,
        lastActive: new Date(),
        isOAuthUser: true
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️  Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// GitHub OAuth Strategy (only initialize if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URI || "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ 
        $or: [
          { githubId: profile.id },
          { email: profile.emails?.[0]?.value }
        ]
      });

      if (user) {
        // Update GitHub ID if not set
        if (!user.githubId) {
          user.githubId = profile.id;
          user.lastActive = new Date();
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = new User({
        githubId: profile.id,
        displayName: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
        leetcodeUsername: '', // Will be set during onboarding
        password: 'oauth-user', // Placeholder for OAuth users
        avatar: profile.photos[0]?.value || null,
        githubUsername: profile.username,
        lastActive: new Date(),
        isOAuthUser: true
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️  GitHub OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

module.exports = passport;
