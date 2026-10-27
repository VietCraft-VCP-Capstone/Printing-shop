const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/google', AuthController.googleLogin);
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/dev-login', AuthController.devLogin);
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/profile', authenticate, AuthController.updateProfile);

module.exports = router;
