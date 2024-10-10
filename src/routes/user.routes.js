import {Router} from 'express';
import passport from '../config/passport.js';
import {registerUser,loginUser, logoutUser} from "../controllers/user.controllers.js"

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

// Google OAuth Routes
router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    successRedirect: '/api/v1/users/auth/protected',  // Redirect to protected route on success
    failureRedirect: '/api/v1/users/auth/google/failure'  // Redirect to failure route on failure
  }));

// Protected route (after successful Google OAuth login)
router.route('/auth/protected')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json({ message: `Welcome ${req.user.fullName}` });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

// Failure Route
router.route('/auth/google/failure')
  .get((req, res) => {
    res.status(401).json({ message: 'Google authentication failed' });
  });
  
  router.route("/logout").get(logoutUser); 

export default router;