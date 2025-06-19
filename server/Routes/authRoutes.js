/*const { Signup, Login } = require('../Controllers/AuthController')
const { userVerification } = require('../Middlewares/AuthMiddleware');
const router = require('express').Router()

router.post('/signup', Signup)
router.post('/login', Login)
router.post('/verify-cookie',userVerification)

module.exports = router
*/

const express = require('express');
const router = express.Router();
const { Signup, Login } = require('../Controllers/AuthController');

// Route for user registration
router.post('/register', Signup);

// Route for user login
router.post('/login', Login);
module.exports = router;