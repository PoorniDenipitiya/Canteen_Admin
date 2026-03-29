const express = require('express');
const router = express.Router();
const { Signup, Login } = require('../Controllers/AuthController');

router.post('/register', Signup);

router.post('/login', Login);
module.exports = router;

