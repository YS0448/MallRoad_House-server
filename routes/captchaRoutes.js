const express = require('express');
const router = express.Router();
const captcha = require('../controllers/common/captchaController');

router.get("/captcha",captcha );

module.exports = router;
