import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { User } from '../models/user.model.js'; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/users/auth/google/callback",
      prompt: 'select_account'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in your database
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If user doesn't exist, create a new user and store the displayName and email
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,  
            email: profile.emails[0].value,  
       
          });
        }

        // Pass the user to the done callback
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {  
  done(null, user.id);  // Only serialize the user ID
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {

  try {
    const user = await User.findById(id);  // Retrieve the user from the database
    done(null, user);  // Pass the user object to req.user
  } catch (error) {
    done(error, null);
  }
});

export default passport;
