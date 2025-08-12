const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController')
const authenticate  = require('../middleware/authMiddleware')

router.post('/signup',authController.signup)
router.post('/login',authController.login)

// Forgot Password Flow
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser); // ← Add this line



module.exports = router