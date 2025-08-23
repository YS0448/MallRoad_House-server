const express = require('express'); 
const router = express.Router();
const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const captchaRoutes = require('./captchaRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/api',customerRoutes);
router.use('/admin' ,adminRoutes);  
router.use(captchaRoutes);

module.exports = router;