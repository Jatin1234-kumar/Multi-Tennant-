// Auth routes block: authentication endpoints with input validation.
const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { loginSchema, googleLoginSchema } = require('../models/schemas/auth.schema');

const router = express.Router();

// Login route block: validates payload then authenticates user.
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleLoginSchema), authController.googleLogin);

module.exports = router;
