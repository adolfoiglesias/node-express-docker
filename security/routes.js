

const express = require('express');
const router = express.Router();

const AuthController = require('./controllers/authController');

router.get('/login/gmail/url', AuthController.getLoginGmail);
router.get('/authenticate/google', AuthController.getAccessTokenGmailFromCode);

router.get('/login/fb/url', AuthController.getLoginFB);
router.get('/authenticate/facebook', AuthController.getAccessTokenFBFromCode);



router.post('/login', AuthController.login);



module.exports = router;